
import { ClickHouseProjectUserRepository } from '../packages/shared/src/lib/clickhouse/repositories/ClickHouseProjectUserRepository';
import { initClickHouse } from '../packages/shared/src/lib/clickhouse';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTest() {
    console.log('Starting Team Management Backend Test...');
    await initClickHouse();

    const projectId = 'test-project-team-mgmt';
    const userId = 'test-user-1';
    const memberId = 'test-member-1';

    // Cleanup first
    await ClickHouseProjectUserRepository.removeMember(projectId, memberId);
    await new Promise(r => setTimeout(r, 1000));

    try {
        console.log('1. Adding Member...');
        await ClickHouseProjectUserRepository.addMember({
            project_id: projectId,
            user_id: memberId,
            role: 'member',
            created_at: new Date().toISOString()
        });
        console.log('✅ Member added.');

        console.log('2. Listing Members...');
        const members = await ClickHouseProjectUserRepository.getMembers(projectId);
        console.log(`Found ${members.length} members.`);
        if (members.length !== 1 || members[0].user_id !== memberId) {
            throw new Error('Member list incorrect');
        }
        console.log('✅ Member list correct.');

        console.log('3. Updating Role...');
        await ClickHouseProjectUserRepository.updateRole(projectId, memberId, 'admin');
        // Wait for mutation
        await new Promise(r => setTimeout(r, 1000));
        const updatedMembers = await ClickHouseProjectUserRepository.getMembers(projectId);
        if (updatedMembers[0].role !== 'admin') {
            throw new Error('Role update failed');
        }
        console.log('✅ Role updated to admin.');

        console.log('4. Removing Member...');
        await ClickHouseProjectUserRepository.removeMember(projectId, memberId);
        // Wait for mutation
        await new Promise(r => setTimeout(r, 1000));
        const finalMembers = await ClickHouseProjectUserRepository.getMembers(projectId);
        if (finalMembers.length !== 0) {
            throw new Error('Remove member failed');
        }
        console.log('✅ Member removed.');

        console.log('🎉 Team Management Backend Test PASSED!');

    } catch (error) {
        console.error('❌ Test FAILED:', error);
    }
}

runTest();
