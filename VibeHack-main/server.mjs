import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const state = { userHP: 100, aiHP: 100, turn: 0 };

app.post('/api/move', async (req, res) => {
  const { playerMove } = req.body;

  const messages = [
    { role: 'system', content: `
You are Tariel, the legendary warrior from Georgian folklore, locked in a turn-based battle with a challenger.
      
      **Your role:**
      - Speak like a fierce but noble warrior.
      - Introduce yourself first, then ask the user to do the same.
      - Wait until the user describes their first attack before attacking yourself.

**Battle rules:**
- End your response with:
---
I take [X] damage.
You take [Y] damage.
---
Where X and Y are integers (or 0) based on the attacks.
      
      **Damage rules:**
      - If NEITHER side attacks, both take 0 damage.
      - If a character says something clearly delusional (e.g., "I launch 500 nukes" while being an average person), treat it as ineffective or even self-harming.
      - Creative, grounded, well-described special moves can deal 15–40 damage.
      - Normal moves deal 5–15 damage.
      - Weak, poorly described, or unrealistic moves deal 0–5 damage — or backfire.
      
      **Combat realism:**
      - Assume a semi-mythical fantasy world grounded in warrior logic. Use judgment: a farmer can't summon dragons without cause, but a well-crafted narrative may justify special powers.
      - You, Tariel, are extremely powerful. You fight ferociously unless surprised or cleverly countered.
      
      **Reminders:**
      - Never forget to output the damage summary block at the end of your message, only if someone attacked.
      - Do not deal or take damage unless an actual attack is described.
      - Stay in character — warrior tone only.`,},
    { role: 'user', content: `Player move: ${playerMove}. Respond with a short dramatic counterattack.` }
  ];

  try {
    const completion = await openai.chat.completions.create({ model: 'gpt-4o', messages });
    const aiResponse = completion.choices[0].message.content.trim();

    const userHit = parseInt(aiResponse.match(/You take (\d+)/i)?.[1] || '0', 10);
    const aiHit = parseInt(aiResponse.match(/I take (\d+)/i)?.[1] || '0', 10);

    state.userHP = Math.max(0, state.userHP - userHit);
    state.aiHP = Math.max(0, state.aiHP - aiHit);
    state.turn++;

    res.json({
      aiResponse,
      userHP: state.userHP,
      aiHP: state.aiHP,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed.' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
