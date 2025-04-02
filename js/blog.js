class BlogHandler {
    constructor() {
        this.currentPost = null;
    }

    async loadPosts() {
        try {
            const posts = await ApiService.blog.getPosts();
            this.displayPosts(posts);
        } catch (error) {
            showToast('Error', 'Failed to load blog posts');
        }
    }

    displayPosts(posts) {
        const blogPosts = document.getElementById('blogPosts');
        blogPosts.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'col-md-4 mb-4';
            postElement.innerHTML = `
                <div class="card blog-post h-100">
                    <img src="${post.image}" class="card-img-top" alt="${post.title}">
                    <div class="card-body">
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.content.slice(0, 150)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">By ${post.author}</small>
                            <small class="text-muted">${post.date}</small>
                        </div>
                        <button class="btn btn-primary mt-3 w-100" onclick="blogHandler.showPost(${post.id})">
                            Read More
                        </button>
                    </div>
                </div>
            `;
            blogPosts.appendChild(postElement);
        });
    }

    async showPost(postId) {
        try {
            const post = await ApiService.blog.getPost(postId);
            this.currentPost = post;
            this.displayFullPost(post);
        } catch (error) {
            showToast('Error', 'Failed to load post');
        }
    }

    displayFullPost(post) {
        const blogPosts = document.getElementById('blogPosts');
        blogPosts.innerHTML = `
            <div class="col-12">
                <div class="blog-post">
                    <button class="btn btn-outline-secondary mb-4" onclick="blogHandler.loadPosts()">
                        <i class="bi bi-arrow-left me-2"></i>Back to Posts
                    </button>
                    <img src="${post.image}" class="img-fluid rounded mb-4" alt="${post.title}" style="width: 100%; height: 400px; object-fit: cover;">
                    <h2 class="mb-3">${post.title}</h2>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <small class="text-muted">By ${post.author}</small>
                        <small class="text-muted">${post.date}</small>
                    </div>
                    <div class="blog-content">
                        ${post.content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>
                    ${this.getCommentSection()}
                </div>
            </div>
        `;

        if (post.comments && post.comments.length > 0) {
            const commentsContainer = document.getElementById('comments');
            post.comments.forEach(comment => this.addComment(comment));
        }
    }

    getCommentSection() {
        if (!auth.isAuthenticated()) {
            return `
                <div class="mt-4">
                    <h4 class="mb-3">Comments</h4>
                    <p>Please <a href="#" onclick="showLoginModal()">login</a> to leave a comment.</p>
                    <div id="comments" class="mt-4">
                    </div>
                </div>
            `;
        }

        return `
            <div class="mt-4">
                <h4 class="mb-3">Comments</h4>
                <form id="commentForm" onsubmit="blogHandler.submitComment(event)">
                    <div class="mb-3">
                        <textarea class="form-control" id="commentText" rows="4" required 
                            placeholder="Share your thoughts..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Post Comment</button>
                </form>
                <div id="comments" class="mt-4">
                </div>
            </div>
        `;
    }

    async submitComment(event) {
        event.preventDefault();
        
        const commentText = document.getElementById('commentText').value.trim();
        if (!commentText) return;

        try {
            const user = auth.getCurrentUser();
            const comment = {
                author: user.name,
                text: commentText,
                userId: user.id,
                date: new Date().toLocaleDateString()
            };

            const savedComment = await ApiService.blog.addComment(this.currentPost.id, comment);
            
            this.addComment(savedComment);
            
            document.getElementById('commentForm').reset();
            
            showToast('Success', 'Comment added successfully');
        } catch (error) {
            showToast('Error', 'Failed to add comment');
        }
    }

    addComment(comment) {
        const comments = document.getElementById('comments');
        const commentElement = document.createElement('div');
        commentElement.className = 'card';

        const currentUser = auth.getCurrentUser();
        const isAuthor = currentUser && currentUser.id === comment.userId;

        commentElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <p class="card-text mb-0">${comment.text}</p>
                    ${isAuthor ? `
                        <button class="btn btn-sm btn-outline-danger ms-2" 
                            onclick="blogHandler.deleteComment(${this.currentPost.id}, ${comment.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="d-flex justify-content-between">
                    <small class="text-muted">By ${comment.author}</small>
                    <small class="text-muted">${new Date(comment.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `;
        comments.prepend(commentElement);
    }

    async deleteComment(postId, commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const currentUser = auth.getCurrentUser();
            await ApiService.blog.deleteComment(postId, commentId, currentUser.id);
            
            await this.showPost(postId);
            
            showToast('Success', 'Comment deleted successfully');
        } catch (error) {
            showToast('Error', 'Failed to delete comment');
        }
    }
}


const blogHandler = new BlogHandler();
document.querySelector('a[href="#blog"]').addEventListener('click', () => {
    blogHandler.loadPosts();
}); 