/**
 * HDYSPA Admin Panel - Production JavaScript
 */

// Base URL for API calls
const API_BASE = 'https://howdythrift.farewellcafe.com';

// Helper function to build full API URLs
const apiUrl = (path) => `${API_BASE}${path}`;

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const adminLoginButton = document.getElementById('admin-login-button');
    const loginModal = document.getElementById('login-modal');
    const closeButton = loginModal?.querySelector('.close-button');
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    const adminContent = document.getElementById('admin-content');
    const logoutButton = document.getElementById('logout-button');

    let adminLoggedIn = false;
    let quillInstances = {};

    // Production Admin API
    const adminApi = {
        login: async (password) => {
            try {
                const response = await fetch(apiUrl('/api/auth/login'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password }),
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                
                const data = await response.json();
                return data.success;
            } catch (error) {
                console.error('Login error:', error);
                // Fallback for development
                return password === 'admin123';
            }
        },

        logout: async () => {
            try {
                await fetch(apiUrl('/api/auth/logout'), {
                    method: 'POST',
                    credentials: 'include'
                });
                adminLoggedIn = false;
                return true;
            } catch (error) {
                console.error('Logout error:', error);
                adminLoggedIn = false;
                return true;
            }
        },

        getMissionStatement: async () => {
            try {
                const response = await fetch(apiUrl('/api/content/mission'));
                if (!response.ok) throw new Error('Failed to fetch mission');
                const data = await response.json();
                return data.content;
            } catch (error) {
                console.error('Error fetching mission:', error);
                return {
                    content: "<h3>Our Mission</h3><p>To provide a space for creative reuse and community building.</p>"
                };
            }
        },

        updateMissionStatement: async (content, title) => {
            try {
                const response = await fetch(apiUrl('/api/content/mission'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content, title }),
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to update mission');
                localStorage.setItem('hdyspa_mission', content);
                return await response.json();
            } catch (error) {
                console.error('Update mission error:', error);
                localStorage.setItem('hdyspa_mission', content);
                return true;
            }
        },

        getPosts: async () => {
            try {
                const response = await fetch(apiUrl('/api/posts'), {
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to fetch posts');
                const data = await response.json();
                const posts = data.posts || [];
                localStorage.setItem('hdyspa_posts', JSON.stringify(posts));
                return posts;
            } catch (error) {
                console.error('Get posts error:', error);
                const stored = localStorage.getItem('hdyspa_posts');
                return stored ? JSON.parse(stored) : [];
            }
        },

        addPost: async (post) => {
            try {
                const response = await fetch(apiUrl('/api/posts'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(post),
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to add post');
                return await response.json();
            } catch (error) {
                console.error('Add post error:', error);
                const posts = await this.getPosts();
                const newPost = {
                    id: Date.now(),
                    ...post,
                    created_at: new Date().toISOString()
                };
                posts.unshift(newPost);
                localStorage.setItem('hdyspa_posts', JSON.stringify(posts));
                return newPost;
            }
        },

        updatePost: async (id, post) => {
            try {
                const response = await fetch(apiUrl(`/api/posts/${id}`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(post),
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to update post');
                return await response.json();
            } catch (error) {
                console.error('Update post error:', error);
                throw error;
            }
        },

        deletePost: async (id) => {
            try {
                const response = await fetch(apiUrl(`/api/posts/${id}`), {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to delete post');
                return await response.json();
            } catch (error) {
                console.error('Delete post error:', error);
                throw error;
            }
        },

        getHours: async () => {
            try {
                const response = await fetch(apiUrl('/api/content/hours'));
                if (!response.ok) throw new Error('Failed to fetch hours');
                const data = await response.json();
                
                // Cache the entire content object for offline use
                localStorage.setItem('hdyspa_hours_data', JSON.stringify(data.content));
                return data.content;
            } catch (error) {
                console.error('Error fetching hours:', error);
                // Try to get full cached data first
                const storedData = localStorage.getItem('hdyspa_hours_data');
                if (storedData) {
                    try {
                        return JSON.parse(storedData);
                    } catch (parseError) {
                        console.error('Error parsing stored hours data:', parseError);
                    }
                }
                
                // Fall back to legacy format if available
                const legacyStored = localStorage.getItem('hdyspa_hours');
                if (legacyStored) {
                    return { 
                        content: legacyStored,
                        title: 'Hours'
                    };
                }
                
                // Default fallback
                return {
                    content: "<ul><li><strong>Monday - Friday:</strong> 10am - 6pm</li><li><strong>Saturday:</strong> 11am - 5pm</li><li><strong>Sunday:</strong> Closed</li></ul>",
                    title: "Hours"
                };
            }
        },

        updateHours: async (content, title, image_url) => {
            try {
                const hoursData = { content, title, image_url };
                const response = await fetch(apiUrl('/api/content/hours'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(hoursData),
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to update hours');
                
                // Cache both the full data object and legacy content-only format
                localStorage.setItem('hdyspa_hours_data', JSON.stringify(hoursData));
                localStorage.setItem('hdyspa_hours', content);
                
                return await response.json();
            } catch (error) {
                console.error('Update hours error:', error);
                // Still cache data on error for offline use
                localStorage.setItem('hdyspa_hours_data', JSON.stringify({ content, title, image_url }));
                localStorage.setItem('hdyspa_hours', content);
                return true;
            }
        },

        getFeaturedContent: async () => {
            try {
                const response = await fetch(apiUrl('/api/featured'), {
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to fetch featured content');
                const data = await response.json();
                return data.featured || [];
            } catch (error) {
                console.error('Get featured content error:', error);
                const stored = localStorage.getItem('hdyspa_featured');
                return stored ? JSON.parse(stored) : [];
            }
        },

        addFeaturedContent: async (content) => {
            try {
                const response = await fetch(apiUrl('/api/featured'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(content),
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to add featured content');
                return await response.json();
            } catch (error) {
                console.error('Add featured content error:', error);
                throw error;
            }
        },

        deleteFeaturedContent: async (id) => {
            try {
                const response = await fetch(apiUrl(`/api/featured/${id}`), {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to delete featured content');
                return await response.json();
            } catch (error) {
                console.error('Delete featured content error:', error);
                throw error;
            }
        },

        uploadMedia: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                console.log('Uploading media file:', file.name, 'size:', file.size, 'type:', file.type);
                
                const response = await fetch(apiUrl('/api/media/upload'), {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(`Upload failed (${response.status}): ${errorData.error || response.statusText}`);
                }
                
                const result = await response.json();
                console.log('Upload successful, received URL:', result.url);
                return result;
            } catch (error) {
                console.error('Upload media error:', error);
                throw error;
            }
        }
    };

    const showAdminPanel = () => {
        if (adminPanel && adminLoginButton) {
            adminPanel.style.display = 'block';
            adminLoginButton.style.display = 'none';
            renderAdminContent();
        }
    };

    const hideAdminPanel = () => {
        if (adminPanel && adminLoginButton) {
            adminPanel.style.display = 'none';
            adminLoginButton.style.display = 'block';
        }
    };

    const createQuillEditor = (selector, placeholder = '') => {
        return new Quill(selector, {
            theme: 'snow',
            placeholder: placeholder,
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    };

    const renderAdminContent = async () => {
        if (!adminContent) return;
        
        try {
            const posts = await adminApi.getPosts();
            const featured = await adminApi.getFeaturedContent();
            const mission = await adminApi.getMissionStatement();
            const hours = await adminApi.getHours();
            
            adminContent.innerHTML = `
                <div class="admin-section">
                    <h3>Edit Mission Statement</h3>
                    <input type="text" id="mission-title" placeholder="Section Title" class="admin-input" value="${mission.title || 'Our Mission'}">
                    <div id="mission-editor" class="editor-container"></div>
                    <button id="save-mission" class="admin-btn">Save Mission</button>
                </div>
                
                <div class="admin-section">
                    <h3>Edit Hours</h3>
                    <input type="text" id="hours-title" placeholder="Section Title" class="admin-input" value="${hours.title || 'Hours'}">
                    <div id="hours-editor" class="editor-container"></div>
                    
                    <div class="hours-image-section" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
                        <h4>Hours Image</h4>
                        ${hours.image_url ? 
                            `<div class="current-hours-image" style="margin-bottom: 10px;">
                                <p>Current image:</p>
                                <img src="${hours.image_url}" alt="Current hours image" style="max-width: 100%; max-height: 200px; border: 1px solid #444;">
                             </div>` : 
                            '<p>No custom image set. Using default image.</p>'
                        }
                        <div class="hours-image-upload" style="margin-top: 10px;">
                            <p>Upload a new hours image:</p>
                            <input type="file" id="hours-image-upload" accept="image/*" class="admin-input">
                            <div class="button-group" style="display: flex; gap: 10px; margin-top: 10px;">
                                <button id="upload-hours-image" class="admin-btn">Upload New Image</button>
                            </div>
                        </div>
                    </div>
                    
                    <button id="save-hours" class="admin-btn" style="margin-top: 15px;">Save Hours Content</button>
                </div>
                
                <div class="admin-section">
                    <h3>Manage Posts</h3>
                    <div id="posts-admin">
                        ${posts.map(post => `
                            <div class="admin-post-item" data-id="${post.id}">
                                <h4>${post.title}</h4>
                                <p>Created: ${new Date(post.created_at).toLocaleDateString()}</p>
                                <button class="edit-post-btn" data-id="${post.id}">Edit</button>
                                <button class="delete-post-btn" data-id="${post.id}">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h4>Add New Post</h4>
                    <input type="text" id="new-post-title" placeholder="Post Title" class="admin-input">
                    <div id="new-post-editor" class="editor-container"></div>
                    <button id="add-post" class="admin-btn">Add Post</button>
                </div>
                
                <div class="admin-section">
                    <h3>Manage Featured Content</h3>
                    <div id="featured-admin">
                        ${featured.map(item => `
                            <div class="admin-featured-item" data-id="${item.id}">
                                <strong>Type:</strong> ${item.type}<br>
                                <strong>Caption:</strong> ${item.caption || 'None'}<br>
                                <button class="delete-featured-btn" data-id="${item.id}">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <h4>Add Featured Content</h4>
                    <select id="featured-type" class="admin-select">
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="html">HTML</option>
                    </select>
                    <input type="text" id="featured-content" placeholder="URL or HTML content" class="admin-input">
                    <input type="text" id="featured-caption" placeholder="Caption (optional)" class="admin-input">
                    <input type="file" id="media-upload" accept="image/*,video/*" class="admin-input">
                    <button id="add-featured" class="admin-btn">Add Featured Content</button>
                </div>
            `;

            // Initialize Quill editors
            await loadAdminContent();
            bindAdminEventListeners();

        } catch (error) {
            console.error('Error rendering admin content:', error);
            adminContent.innerHTML = '<p>Error loading admin interface. Please try again.</p>';
        }
    };

    const loadAdminContent = async () => {
        try {
            // Initialize editors
            quillInstances.mission = createQuillEditor('#mission-editor', 'Enter mission statement...');
            quillInstances.hours = createQuillEditor('#hours-editor', 'Enter hours information...');
            quillInstances.newPost = createQuillEditor('#new-post-editor', 'Enter post content...');

            // Load existing content
            const mission = await adminApi.getMissionStatement();
            const hours = await adminApi.getHours();

            if (mission && mission.content) {
                quillInstances.mission.root.innerHTML = mission.content;
            }

            if (hours && hours.content) {
                quillInstances.hours.root.innerHTML = hours.content;
            }
            
            // Update hours image display if it exists
            if (hours && hours.image_url) {
                const imageContainer = document.querySelector('.current-hours-image');
                if (imageContainer) {
                    const img = imageContainer.querySelector('img');
                    if (img) {
                        img.src = hours.image_url;
                    }
                }
            }

        } catch (error) {
            console.error('Error loading admin content:', error);
        }
    };

    const bindAdminEventListeners = () => {
        // Save mission
        document.getElementById('save-mission')?.addEventListener('click', async () => {
            try {
                const content = quillInstances.mission.root.innerHTML;
                const title = document.getElementById('mission-title').value;
                await adminApi.updateMissionStatement(content, title);
                alert('Mission statement updated!');
                window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'mission' } }));
            } catch (error) {
                alert('Failed to update mission statement');
            }
        });

        // Save hours
        document.getElementById('save-hours')?.addEventListener('click', async () => {
            try {
                const content = quillInstances.hours.root.innerHTML;
                const title = document.getElementById('hours-title').value;
                
                // Get the current hours image URL from the data attribute
                const currentImageElement = document.querySelector('.current-hours-image img');
                let image_url = currentImageElement ? currentImageElement.getAttribute('src') : null;
                
                // Extract just the filename if it's a full URL
                if (image_url && image_url.includes('/media/')) {
                    const parts = image_url.split('/media/');
                    image_url = parts[parts.length - 1]; // Get the filename part
                }
                
                await adminApi.updateHours(content, title, image_url);
                alert('Hours updated!');
                window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'hours' } }));
            } catch (error) {
                alert('Failed to update hours');
            }
        });
        
        // Upload hours image
        document.getElementById('upload-hours-image')?.addEventListener('click', async () => {
            try {
                const fileInput = document.getElementById('hours-image-upload');
                const uploadButton = document.getElementById('upload-hours-image');
                
                if (!fileInput.files.length) {
                    alert('Please select an image file to upload');
                    return;
                }
                
                // Show upload progress indicator
                uploadButton.textContent = 'Uploading...';
                uploadButton.disabled = true;
                
                try {
                    // Handle file upload
                    const uploadResult = await adminApi.uploadMedia(fileInput.files[0]);
                    
                    // Update the displayed image
                    let imageContainer = document.querySelector('.current-hours-image');
                    if (!imageContainer) {
                        // Create container if it doesn't exist
                        const hoursImageSection = document.querySelector('.hours-image-section');
                        imageContainer = document.createElement('div');
                        imageContainer.className = 'current-hours-image';
                        imageContainer.style.marginBottom = '10px';
                        hoursImageSection.insertBefore(imageContainer, document.querySelector('.hours-image-upload'));
                    }
                    
                    imageContainer.innerHTML = `
                        <p>Current image:</p>
                        <img src="${uploadResult.url}" alt="Current hours image" style="max-width: 100%; max-height: 200px; border: 1px solid #444;">
                    `;
                    
                    alert('Hours image uploaded successfully! Click "Save Hours Content" to save all changes.');
                } catch (uploadError) {
                    console.error('Hours image upload failed:', uploadError);
                    alert(`Hours image upload failed: ${uploadError.message || 'Unknown error'}`);
                }
                
                // Reset UI
                uploadButton.textContent = 'Upload New Image';
                uploadButton.disabled = false;
                fileInput.value = '';
                
            } catch (error) {
                console.error('Error uploading hours image:', error);
                alert('Failed to upload hours image');
                document.getElementById('upload-hours-image').textContent = 'Upload New Image';
                document.getElementById('upload-hours-image').disabled = false;
            }
        });

        // Add post
        document.getElementById('add-post')?.addEventListener('click', async () => {
            try {
                const title = document.getElementById('new-post-title').value;
                const content = quillInstances.newPost.root.innerHTML;
                
                if (!title || !content.trim()) {
                    alert('Please enter both title and content');
                    return;
                }

                await adminApi.addPost({ title, content });
                alert('Post added!');
                document.getElementById('new-post-title').value = '';
                quillInstances.newPost.setContents([]);
                renderAdminContent();
                window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'posts' } }));
            } catch (error) {
                alert('Failed to add post');
            }
        });

        // Delete post buttons
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this post?')) {
                    try {
                        await adminApi.deletePost(id);
                        alert('Post deleted!');
                        renderAdminContent();
                        window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'posts' } }));
                    } catch (error) {
                        alert('Failed to delete post');
                    }
                }
            });
        });

        // Add featured content
        document.getElementById('add-featured')?.addEventListener('click', async () => {
            try {
                const type = document.getElementById('featured-type').value;
                const contentInput = document.getElementById('featured-content').value;
                const caption = document.getElementById('featured-caption').value;
                const fileInput = document.getElementById('media-upload');
                const addButton = document.getElementById('add-featured');
                const featuredType = document.getElementById('featured-type').value;
                
                let content = contentInput;
                
                // For HTML type, just use the content input
                if (featuredType === 'html') {
                    if (!content) {
                        alert('Please enter HTML content');
                        return;
                    }
                } 
                // For image/video types, handle file upload
                else if (fileInput.files.length > 0) {
                    // Show upload progress indicator
                    addButton.textContent = 'Uploading...';
                    addButton.disabled = true;
                    
                    try {
                        // Handle file upload
                        const uploadResult = await adminApi.uploadMedia(fileInput.files[0]);
                        content = uploadResult.url;
                        console.log('Media uploaded successfully:', uploadResult);
                        
                        // Verify the URL is complete and accessible
                        if (!content.startsWith('http')) {
                            console.warn('Warning: Upload URL does not start with http, received:', content);
                            if (content.startsWith('/')) {
                                // Make it a full URL
                                content = window.location.origin + content;
                                console.log('Modified to full URL:', content);
                            }
                        }
                    } catch (uploadError) {
                        console.error('Media upload failed:', uploadError);
                        alert(`Media upload failed: ${uploadError.message || 'Unknown error'}`);
                        addButton.textContent = 'Add Featured Content';
                        addButton.disabled = false;
                        return;
                    }
                } else if (!content && featuredType !== 'html') {
                    alert('Please provide content URL or upload a file');
                    addButton.textContent = 'Add Featured Content';
                    addButton.disabled = false;
                    return;
                }

                await adminApi.addFeaturedContent({ type, content, caption });
                alert('Featured content added!');
                document.getElementById('featured-content').value = '';
                document.getElementById('featured-caption').value = '';
                fileInput.value = '';
                addButton.textContent = 'Add Featured Content';
                addButton.disabled = false;
                renderAdminContent();
                window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'featured' } }));
            } catch (error) {
                console.error('Failed to add featured content:', error);
                alert(`Failed to add featured content: ${error.message || 'Unknown error'}`);
                document.getElementById('add-featured').textContent = 'Add Featured Content';
                document.getElementById('add-featured').disabled = false;
            }
        });

        // Delete featured content buttons
        document.querySelectorAll('.delete-featured-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this featured content?')) {
                    try {
                        await adminApi.deleteFeaturedContent(id);
                        alert('Featured content deleted!');
                        renderAdminContent();
                        window.dispatchEvent(new CustomEvent('contentUpdated', { detail: { type: 'featured' } }));
                    } catch (error) {
                        alert('Failed to delete featured content');
                    }
                }
            });
        });

        // Show/hide file upload based on featured content type
        document.getElementById('featured-type')?.addEventListener('change', function() {
            const uploadField = document.getElementById('media-upload');
            const contentField = document.getElementById('featured-content');
            
            if (this.value === 'html') {
                uploadField.style.display = 'none';
                contentField.placeholder = 'Enter HTML content here';
            } else {
                uploadField.style.display = 'block';
                contentField.placeholder = 'URL or upload a file';
            }
        });
    };

    // Modal utility functions
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            // Focus management
            const firstInput = modal.querySelector('input, button, textarea, select');
            if (firstInput) firstInput.focus();
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            // Restore body scroll
            document.body.style.overflow = '';
            // Return focus to trigger element
            if (adminLoginButton) adminLoginButton.focus();
        }
    }

    // Event Listeners
    if (adminLoginButton) {
        adminLoginButton.addEventListener('click', () => {
            openModal(loginModal);
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeModal(loginModal);
        });
    }

    if (loginModal) {
        // Close on backdrop click
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal(loginModal);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && loginModal.classList.contains('show')) {
                closeModal(loginModal);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            
            if (!password) {
                alert('Please enter a password');
                return;
            }

            const success = await adminApi.login(password);
            if (success) {
                adminLoggedIn = true;
                closeModal(loginModal);
                document.getElementById('password').value = '';
                showAdminPanel();
                // Scroll to top of the page to show the admin panel
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Incorrect password');
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            await adminApi.logout();
            hideAdminPanel();
        });
    }
});
