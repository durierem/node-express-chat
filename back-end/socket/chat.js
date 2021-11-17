const User = require('../models/user');
const Message = require('../models/message');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`[${socket.id}]: connected`);

    socket.on('login', async (username, callback) => {
      console.log(`[${socket.id}]: user '${username}' logged in`);

      const user = new User({ name: username, session_id: socket.id });

      try {
        user.save();

        // Get connected users
        const connectedSocketsIds = (await io.fetchSockets()).map((socket) => socket.id);
        const users = await User.find({
          session_id: { $in: connectedSocketsIds }
        });

        const messages = await Message.find();

        callback({
          ok: true,
          users: users,
          messages: messages,
          me: user,
        });

        socket.broadcast.emit('login', user);

        const perUserMessagesCount = await Message.aggregate([
          { $match: { session_id: { $in: connectedSocketsIds } } },
          { $group: { _id: '$session_id', count: { $sum: 1 } } }
        ]);
        socket.emit('counter', {
          total: messages.length,
          per_user: perUserMessagesCount
        })
      } catch (error) {
        callback({ ok: false, message: error });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`[${socket.id}]: disconnected`);
      try {
        const user = await User.findOneAndDelete({ session_id: socket.id });
        socket.broadcast.emit('logout', user);
      } catch (error) {
        console.error(`[${socket.id}]: ${error.message}`);
      }
    });

    socket.on('message', async (text, callback) => {
      console.log(`[${socket.id}]: message sent '${text}'`);
      const user = await User.findOne({ session_id: socket.id });
      const message = new Message({
        username: user.name,
        content: text,
        timestamp: Date.now(),
        session_id: socket.id
      });

      try {
        message.save()
        callback({ ok: true, message: message });
        socket.broadcast.emit('message', message);
      } catch {
        callback({ ok: false, message: error });
      }

      const totalMessagesCount = await Message.countDocuments();
      console.log(totalMessagesCount)
      const perUserMessagesCount = await Message.aggregate([
        { $match: { session_id: socket.id} },
        { $group: { _id: '$session_id', count: { $sum: 1 } } }
      ]);
      io.emit('counter', {
        total: totalMessagesCount,
        per_user: perUserMessagesCount
      });
    });
  });
};
