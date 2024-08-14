document.addEventListener('DOMContentLoaded', loadPosts);

function addPost() {
    const usernameInput = document.getElementById('usernameInput');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');
    const postsContainer = document.getElementById('postsContainer');

    const username = usernameInput.value.trim();
    const text = textInput.value.trim();
    const imageFile = imageInput.files[0];

    if (username === "" || (text === "" && !imageFile)) {
        alert("¡Debes ingresar tu nombre y algún contenido!");
        return;
    }

    const post = {
        username: username,
        text: text,
        image: null,
        comments: []
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            post.image = e.target.result;
            savePost(post);
        }
        reader.readAsDataURL(imageFile);
    } else {
        savePost(post);
    }

    // Limpiar campos
    textInput.value = '';
    imageInput.value = '';
}

function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    displayPosts();
}

function displayPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = ''; // Limpiar publicaciones existentes
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';

        const usernameDiv = document.createElement('div');
        usernameDiv.className = 'username';
        usernameDiv.textContent = post.username;
        postDiv.appendChild(usernameDiv);

        if (post.image) {
            const img = document.createElement('img');
            img.src = post.image;
            postDiv.appendChild(img);
        }

        if (post.text) {
            const p = document.createElement('p');
            p.textContent = post.text;
            postDiv.appendChild(p);
        }

        const likeBtn = document.createElement('button');
        likeBtn.className = 'like-btn';
        likeBtn.textContent = '👍 0';
        likeBtn.onclick = function() {
            let currentLikes = parseInt(likeBtn.textContent.split(' ')[1]);
            likeBtn.textContent = `👍 ${currentLikes + 1}`;
        }
        postDiv.appendChild(likeBtn);

        const commentSection = document.createElement('div');
        commentSection.className = 'comment-section';

        const commentInput = document.createElement('input');
        commentInput.type = 'text';
        commentInput.placeholder = 'Escribe un comentario...';

        const commentButton = document.createElement('button');
        commentButton.textContent = 'Comentar';
        commentButton.onclick = function() {
            addComment(post, commentInput.value);
            commentInput.value = ''; // Limpiar el campo después de comentar
        }

        const commentList = document.createElement('div');
        commentList.className = 'comment-list';

        post.comments.forEach(comment => {
            addCommentToList(comment, commentList);
        });

        commentSection.appendChild(commentInput);
        commentSection.appendChild(commentButton);
        commentSection.appendChild(commentList);

        postDiv.appendChild(commentSection);
        postsContainer.prepend(postDiv);
    });
}

function addComment(post, commentText) {
    if (commentText.trim() === "") return;

    post.comments.push({
        username: document.getElementById('usernameInput').value.trim(),
        text: commentText
    });

    localStorage.setItem('posts', JSON.stringify(JSON.parse(localStorage.getItem('posts')).map(p => p === post ? post : p)));
    displayPosts();
}

function addCommentToList(comment, commentList) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = comment.username;

    const commentTextSpan = document.createElement('span');
    commentTextSpan.textContent = comment.text;

    commentDiv.appendChild(usernameSpan);
    commentDiv.appendChild(commentTextSpan);

    commentList.appendChild(commentDiv);
}

function loadPosts() {
    displayPosts();
}
