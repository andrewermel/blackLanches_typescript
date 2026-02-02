import express from 'express';
import { PrismaClient } from '@prisma/client';
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await prisma.user.create({
            data: { name, email, password }
        });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao criar usuário.' });
    }
});
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
//# sourceMappingURL=index.js.map