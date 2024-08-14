// Función para añadir una publicación
function addPost() {
    const usernameInput = document.getElementById('usernameInput');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');

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
}

// Función para guardar la publicación en Firebase
function savePost(post) {
    const postId = Date.now(); // Usa un ID único para cada publicación
    database.ref('posts/' + postId).set(post)
        .then(() => {
            displayPosts(); // Actualiza la visualización de publicaciones
        })
        .catch(error => {
            console.error("Error al guardar la publicación: ", error);
        });
}

// Función para mostrar las publicaciones
function displayPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = ''; // Limpiar publicaciones existentes

    database.ref('posts').once('value', (snapshot) => {
        const posts = snapshot.val() || {};

        for (const postId in posts) {
            const post = posts[postId];
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

            const deletePostBtn = document.createElement('button');
            deletePostBtn.textContent = 'Eliminar Publicación';
            deletePostBtn.onclick = function() {
                deletePost(postId);
            }
            postDiv.appendChild(deletePostBtn);

            const commentSection = document.createElement('div');
            commentSection.className = 'comment-section';

            const commentInput = document.createElement('input');
            commentInput.type = 'text';
            commentInput.placeholder = 'Escribe un comentario...';

            const commentButton = document.createElement('button');
            commentButton.textContent = 'Comentar';
            commentButton.onclick = function() {
                addComment(postId, commentInput.value);
                commentInput.value = ''; // Limpiar el campo después de comentar
            }

            const commentList = document.createElement('div');
            commentList.className = 'comment-list';

            post.comments.forEach((comment, commentId) => {
                addCommentToList(comment, commentId, commentList, postId);
            });

            commentSection.appendChild(commentInput);
            commentSection.appendChild(commentButton);
            commentSection.appendChild(commentList);

            postDiv.appendChild(commentSection);
            postsContainer.prepend(postDiv);
        }
    });
}

// Función para añadir un comentario
function addComment(postId, commentText) {
    if (commentText.trim() === "") return;

    const username = document.getElementById('usernameInput').value.trim();

    const newComment = {
        username: username,
        text: commentText
    };

    database.ref('posts/' + postId + '/comments').push(newComment)
        .then(() => {
            displayPosts(); // Actualiza la visualización de publicaciones
        })
        .catch(error => {
            console.error("Error al añadir el comentario: ", error);
        });
}

// Función para añadir un comentario a la lista
function addCommentToList(comment, commentId, commentList, postId) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = comment.username;

    const commentTextSpan = document.createElement('span');
    commentTextSpan.textContent = comment.text;

    const deleteCommentBtn = document.createElement('button');
    deleteCommentBtn.textContent = 'Eliminar';
    deleteCommentBtn.onclick = function() {
        deleteComment(postId, commentId);
    }

    commentDiv.appendChild(usernameSpan);
    commentDiv.appendChild(commentTextSpan);
    commentDiv.appendChild(deleteCommentBtn);

    commentList.appendChild(commentDiv);
}

// Función para eliminar una publicación
function deletePost(postId) {
    database.ref('posts/' + postId).remove()
        .then(() => {
            displayPosts(); // Actualiza la visualización de publicaciones
        })
        .catch(error => {
            console.error("Error al eliminar la publicación: ", error);
        });
}

// Función para eliminar un comentario
function deleteComment(postId, commentId) {
    database.ref('posts/' + postId + '/comments/' + commentId).remove()
        .then(() => {
            displayPosts(); // Actualiza la visualización de publicaciones
        })
        .catch(error => {
            console.error("Error al eliminar el comentario: ", error);
        });
}

// Cargar publicaciones al inicio
document.addEventListener('DOMContentLoaded', displayPosts);
