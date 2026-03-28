const { client } = require('../../config/redis');

exports.testRedis = async ()=> {

    const sessionKey = `user:174:session:def-123`;
    const sessionData = {
        userId: "174",
        role: "student",
        deviceName: "fy",
        loginDate: new Date().toISOString(),
        fingerprint: "def-123"
    };

    await client.hSet(sessionKey, sessionData);
    await client.expire(sessionKey, 20);


}


