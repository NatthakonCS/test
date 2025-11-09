const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
// ตั้งค่า Socket.IO ให้ทำงานกับ server ที่สร้างขึ้น
const io = socketIo(server); 

const PORT = 3000;

// ให้ Server เสิร์ฟไฟล์ index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// การจัดการการเชื่อมต่อ Socket.IO
io.on('connection', (socket) => {
    console.log('ผู้ใช้ใหม่เชื่อมต่อแล้ว:', socket.id);

    // 1. ผู้ใช้เข้าร่วมห้อง (รับ roomNumber จาก client)
    socket.on('joinRoom', (roomNumber) => {
        // ออกจากห้องเก่า (ถ้ามี) ก่อนเข้าร่วมห้องใหม่
        const currentRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        currentRooms.forEach(room => {
            socket.leave(room);
            console.log(`ผู้ใช้ ${socket.id} ออกจากห้อง ${room}`);
        });

        // เข้าร่วมห้องใหม่
        socket.join(roomNumber);
        console.log(`ผู้ใช้ ${socket.id} เข้าร่วมห้อง ${roomNumber}`);
        
        // ส่งข้อความต้อนรับกลับไปที่ห้องนั้นๆ
        io.to(roomNumber).emit('chatMessage', `*** ผู้ใช้ ${socket.id.substring(0, 4)} เข้าร่วมห้อง ${roomNumber} ***`);
    });

    // 2. รับข้อความจากผู้ใช้
    socket.on('chatMessage', (data) => {
        const { roomNumber, message } = data;
        
        // ตรวจสอบว่าผู้ใช้กำลังอยู่ในห้องนั้นจริงหรือไม่
        if (socket.rooms.has(roomNumber)) {
            // ส่งข้อความไปยัง "ทุกคน" ในห้องนั้น "ยกเว้น" ผู้ส่ง
            socket.to(roomNumber).emit('chatMessage', `ห้อง ${roomNumber} - ${socket.id.substring(0, 4)}: ${message}`);
            // ส่งข้อความกลับไปที่ "ผู้ส่งเอง" เพื่อยืนยัน
            socket.emit('chatMessage', `คุณ: ${message}`);
        } else {
            // กรณีไม่ได้อยู่ในห้อง
            socket.emit('chatMessage', 'คุณยังไม่ได้เข้าร่วมห้อง หรือห้องไม่ถูกต้อง');
        }
    });

    // 3. เมื่อผู้ใช้ออกจากระบบ
    socket.on('disconnect', () => {
        console.log('ผู้ใช้ออกจากระบบ:', socket.id);
    });
});

// เริ่ม Server
server.listen(PORT, () => {
    console.log(`Server กำลังทำงานที่ http://localhost:${PORT}`);
    console.log('เปิดเบราว์เซอร์และลองใช้หลายๆ แท็บ/หน้าต่าง เพื่อทดสอบ');
});
