const connections = {};

export const registerConnection = (req, res, userId) => {
    connections[userId] = res;
    
    // send an initial event to the client
    res.write('log: Connected to SSE stream \n\n');

    // handle client disconnection
    req.on('close', () =>{
        delete connections[userId];
        console.log(`Client ${userId} disconnected from SSE`);
    });
};

export const pushToUser = (userId, data) => {
    if(connections[userId]){
        connections[userId].write(`data: ${JSON.stringify(data)}\n\n`);
    }
};

export const broadcast = (data) => {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    Object.values(connections).forEach(res => {
        res.write(payload);
    });
};
