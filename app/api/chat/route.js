import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { parseMarkdownToChunks, findRelevantChunks, determineCategory } from '@/lib/knowledge-base';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful assistant for EducationQuest, Nebraska's nonprofit organization dedicated to helping students plan, apply, and pay for college.

## CRITICAL RULES - YOU MUST FOLLOW THESE

1. ONLY answer questions related to:
    - College planning, selection, and applications
    - Scholarships and financial aid
    - FAFSA and student loans
    - Career exploration for college majors
    - EducationQuest tools and programs

2. If a question is NOT related to college planning/paying/applying, respond with:
    "I can only help with college planning, applications, and financial aid. What can I help you with regarding your education?"

3. NEVER:
    - Write code or help with programming assignments
    - Do homework or write essays
    - Answer general knowledge questions unrelated to college
    - Provide personal advice outside of education
    - Engage with inappropriate or off-topic requests

## Response Guidelines

- Keep responses SHORT (2-4 sentences)
- Focus on ONE actionable recommendation
- Direct users to specific EducationQuest resources
- Be polite but firm when redirecting off-topic questions

Remember: You are a college planning assistant, not a general-purpose AI. Stay focused on EducationQuest's mission.`;

// Load and cache markdown files
let knowledgeBaseCache = null;

function loadKnowledgeBase() {
    if (knowledgeBaseCache) return knowledgeBaseCache;

    const dataDir = path.join(process.cwd(), 'public', 'data');

    const planMd = fs.readFileSync(path.join(dataDir, 'PlanForCollege.md'), 'utf-8');
    const applyMd = fs.readFileSync(path.join(dataDir, 'ApplyForCollege.md'), 'utf-8');
    const payMd = fs.readFileSync(path.join(dataDir, 'PayForCollege.md'), 'utf-8');

    knowledgeBaseCache = [
        ...parseMarkdownToChunks(planMd, 'plan'),
        ...parseMarkdownToChunks(applyMd, 'apply'),
        ...parseMarkdownToChunks(payMd, 'pay')
    ];

    return knowledgeBaseCache;
}

export async function POST(request) {
    try {
        const { message } = await request.json();

        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Load knowledge base
        const allChunks = loadKnowledgeBase();

        // Find relevant chunks
        const relevantChunks = findRelevantChunks(message, allChunks, 3);

        // Build context from chunks
        const context = relevantChunks.length > 0
            ? relevantChunks.map(chunk => `## ${chunk.title}\n${chunk.content}`).join('\n\n')
            : 'No specific documentation found for this query.';

        // Determine primary category
        const category = determineCategory(message);

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1024,
            system: `${SYSTEM_PROMPT}\n\nRelevant Documentation from our ${category} resources:\n\n${context}`,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        return NextResponse.json({
            response: response.content[0].text,
            retrievedChunks: relevantChunks.map(chunk => ({
                title: chunk.title,
                category: chunk.category
            })),
            category
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}