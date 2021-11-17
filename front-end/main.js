document.addEventListener('DOMContentLoaded', () => {
    const server = 'http://localhost:3000';
    const socket = io(server);

    // LOGIN / LOGOUT

    socket.on('login', (user) => addConnectedUser(user));
    socket.on('logout', (user) => removeConnectedUser(user));

    const namePopup = document.querySelector('.name-popup');
    namePopup.querySelector('input[type=button]').addEventListener('click', () => {
        const name = namePopup.querySelector('input').value;
        socket.emit('login', name, (response) => {
            if (response.ok) {
                namePopup.setAttribute('hidden', 'hidden');
                document.querySelector('.main-app').removeAttribute('hidden');
                document.querySelector('.my-account > .name > span').innerText = name;
                response.messages.forEach((message) => insertMessage(message));
                response.users.forEach((user) => addConnectedUser(user));
            } else {
                console.error(response.message);
            }
        });
    });

    // MESSAGES

    socket.on('message', (message) => insertMessage(message));

    document.querySelector('.send-btn').addEventListener('click', () => {
        const input = document.querySelector('.chat-area .input-area input');
        if (input.value.length > 0) {
            console.log('1: emitting message')
            socket.emit('message', input.value, (response) => {
                if (response.ok) {
                    insertMessage(response.message, { me: true });
                    input.value = '';
                } else {
                    console.error(response.message);
                }
            });
        }
    });

    // COUNTERS

    socket.on('counter', (counter) => updateCounters(counter));
});

function addConnectedUser(user) {
    const html = `
        <li data-id="${user.session_id}">
            <span class="status online">
                <i class="fa fa-circle-o"></i>
            </span>
            <span>${user.name}</span>
            <small>(<em class="messages-count">0</em>)</small>
        </li>
    `;
    document.querySelector('.member-list').insertAdjacentHTML('beforeend', html);
}

function removeConnectedUser(user) {
    document.querySelector(`[data-id="${user.session_id}"`).remove();
}

function insertMessage(message, options = {}) {
    const html = `
        <li class="${options.me ? 'me' : ''}">
            <div class="name">
                <span class="">${message.username}</span>
            </div>
            <div class="message">
                <p>${message.content}</p>
                <span class="msg-time">${(new Date(message.timestamp)).toLocaleString()}</span>
            </div>
        </li>
    `;
    const chatList = document.querySelector('.chat-list');
    chatList.firstElementChild.insertAdjacentHTML('beforeend', html);
    chatList.scrollTop = chatList.scrollHeight;
}

function updateCounters(counter) {
    console.log(counter)
    document.querySelector('.chat-area .messages-count').innerText = counter.total;
    counter.per_user.forEach((user_counter) => {
        document.querySelector(`[data-id="${user_counter._id}"] .messages-count`).innerText = user_counter.count;
    });
}
