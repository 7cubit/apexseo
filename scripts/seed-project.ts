import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:4000';

async function seedProject() {
    console.log('Creating test project...');

    // Create a project
    const projectData = {
        id: 'test-project-1',
        name: 'Example SEO Site',
        domain: 'example.com',
        user_id: 'user-1',
        created_at: new Date().toISOString().replace('T', ' ').split('.')[0]
    };

    try {
        // Note: We'll need to call ClickHouse directly since we don't have a create project API endpoint yet
        // Let's create a simple HTTP request to the API
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            console.log('✅ API is running');
        }

        // Since we need to create the project in ClickHouse, let's do it directly
        const { ClickHouseProjectRepository } = await import('@apexseo/shared');

        await ClickHouseProjectRepository.createTable();
        console.log('✅ Projects table created');

        await ClickHouseProjectRepository.create(projectData);
        console.log('✅ Project created:', projectData.name);

        // Verify
        const projects = await ClickHouseProjectRepository.getAll();
        console.log(`✅ Total projects: ${projects.length}`);

        console.log('\n🎉 Seed completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Run the sync script again to create Temporal schedules');
        console.log('2. Start the worker: cd packages/workers && npm run dev');
        console.log('3. Check Temporal UI: http://localhost:8080');

    } catch (error) {
        console.error('❌ Error seeding project:', error);
        process.exit(1);
    }

    process.exit(0);
}

seedProject();
