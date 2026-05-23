import { Client, Databases, Storage } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
    }
});

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.NEXT_APPWRITE_KEY);

const databases = new Databases(client);

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const workspacesId = process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID;
const membersId = process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID;
const projectsId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID;
const tasksId = process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID;

async function setup() {
    console.log("Setting up Workspaces attributes...");
    await createAttributeString(workspacesId, 'name', 256, true);
    await createAttributeString(workspacesId, 'imageUrl', 2048, false);
    await createAttributeString(workspacesId, 'inviteCode', 256, true);
    await createAttributeString(workspacesId, 'userId', 256, true);

    console.log("Setting up Members attributes...");
    await createAttributeString(membersId, 'workspaceId', 256, true);
    await createAttributeString(membersId, 'userId', 256, true);
    await createAttributeString(membersId, 'role', 256, true);

    console.log("Setting up Projects attributes...");
    await createAttributeString(projectsId, 'name', 256, true);
    await createAttributeString(projectsId, 'imageUrl', 2048, false);
    await createAttributeString(projectsId, 'workspaceId', 256, true);

    console.log("Setting up Tasks attributes...");
    await createAttributeString(tasksId, 'name', 256, true);
    await createAttributeString(tasksId, 'status', 256, true);
    await createAttributeString(tasksId, 'workspaceId', 256, true);
    await createAttributeString(tasksId, 'assigneeId', 256, true);
    await createAttributeString(tasksId, 'projectId', 256, true);
    await createAttributeInteger(tasksId, 'position', true);
    await createAttributeDatetime(tasksId, 'dueDate', true);
    await createAttributeString(tasksId, 'description', 2048, false);

    console.log("Waiting for attributes to be ready...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("Setup complete!");
}

async function createAttributeString(collectionId, key, size, required) {
    try {
        await databases.createStringAttribute(dbId, collectionId, key, size, required);
        console.log(`Created string attribute: ${key} in ${collectionId}`);
    } catch (e) {
        if (e.code === 409) {
            console.log(`Attribute ${key} already exists in ${collectionId}`);
        } else {
            console.error(`Error creating attribute ${key}:`, e.message);
        }
    }
}

async function createAttributeInteger(collectionId, key, required) {
    try {
        await databases.createIntegerAttribute(dbId, collectionId, key, required);
        console.log(`Created integer attribute: ${key} in ${collectionId}`);
    } catch (e) {
        if (e.code === 409) {
            console.log(`Attribute ${key} already exists in ${collectionId}`);
        } else {
            console.error(`Error creating attribute ${key}:`, e.message);
        }
    }
}

async function createAttributeDatetime(collectionId, key, required) {
    try {
        await databases.createDatetimeAttribute(dbId, collectionId, key, required);
        console.log(`Created datetime attribute: ${key} in ${collectionId}`);
    } catch (e) {
        if (e.code === 409) {
            console.log(`Attribute ${key} already exists in ${collectionId}`);
        } else {
            console.error(`Error creating attribute ${key}:`, e.message);
        }
    }
}

setup().catch(console.error);
