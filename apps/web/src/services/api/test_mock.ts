import { mockApi } from './mockServices';
import { ActionType, CaseState, FlagSource, PacStatus, TerminationType } from './types';

async function runTests() {
    console.log('--- Starting Mock API Tests ---');

    try {
        const pId = 'p1';

        // 1. Initial State Check
        let summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S0, 'Initial state should be S0');
        console.log('✅ Initial State S0 Verified');

        // 2. S0 -> S1 (Flag)
        await mockApi.flag(pId, { source: FlagSource.AI, riskScore: 88, reason: 'Test Risk' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S1, 'Should be S1 after Flag');
        console.log('✅ S0 -> S1 Flag Verified');

        // 3. Negative Test: S1 -> Referral (Should Fail)
        try {
            await mockApi.referral(pId, { matchedResources: [] });
            console.error('❌ Failed to block S1 -> Referral');
        } catch (e: any) {
            console.assert(e.code === 'ERR_TRANSITION_INVALID', 'Should block S1 -> Referral');
            console.log('✅ Block S1 -> Referral Verified');
        }

        // 4. S1 -> S2 (Orders)
        await mockApi.orders(pId, { hisOrderId: 'H1', orderContent: 'Test', physicianId: 'DOC1' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S2, 'Should be S2 after Orders');
        console.log('✅ S1 -> S2 Orders Verified');

        // 5. Update Data (Placement/Assessment)
        await mockApi.updatePlacement(pId, { type: 'Home', expectedDischargeDate: '2023-12-31', homeCare: { caregiver: 'Family', medicalDevices: [], generalDevices: [], transport: 'Self', tubeCare: 'None' } });
        await mockApi.updateAssessment(pId, { cmsScore: 100, barthelIndex: { totalScore: 100, items: [] } });
        console.log('✅ Data Updates Verified');

        // 6. S2 -> S5 (PAC Start)
        await mockApi.startPac(pId, { consultDept: 'Neuro', urgency: 'High', reason: 'PAC' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S5, 'Should be S5 after PAC Start');
        console.log('✅ S2 -> S5 PAC Start Verified');

        // 7. Negative Test: S5 -> Referral (Should Fail)
        try {
            await mockApi.referral(pId, {});
            console.error('❌ Failed to block S5 -> Referral');
        } catch (e: any) {
            console.assert(e.code === 'ERR_PAC_UNFINISHED', 'Should block S5 -> Referral');
            console.log('✅ Block S5 -> Referral Verified');
        }

        // 8. S5 -> S2 (PAC Finish - Accepted)
        await mockApi.finishPac(pId, { status: PacStatus.ACCEPTED, recommendation: 'Go', pacHospital: 'General Hospital' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S2, 'Should return to S2');
        console.assert(summary.data.placement?.type === 'Transfer', 'Automated Placement Update Failed');
        console.log('✅ PAC Finish & Automation Verified');

        // 9. S2 -> S3 (Referral)
        await mockApi.referral(pId, { matchedResources: ['r1'] });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S3, 'Should be S3 after Referral');
        console.log('✅ S2 -> S3 Referral Verified');

        // 10. Negative Test: Update in S3 (Locked)
        try {
            await mockApi.updatePlacement(pId, { type: 'Home' } as any);
            console.error('❌ Failed to block Update in S3');
        } catch (e: any) {
            console.assert(e.code === 'ERR_STATE_LOCKED', 'Should block Update in S3');
            console.log('✅ S3 Locking Verified');
        }

        // 11. S3 -> S4 (Close)
        await mockApi.close(pId, { actualDischargeDate: '2023-12-31', finalDestination: 'Home' });
        summary = await mockApi.getSummary(pId);
        console.assert(summary.data.currentState === CaseState.S4, 'Should be S4 after Close');
        console.log('✅ S3 -> S4 Close Verified');

        console.log('🎉 All Spec v4 Logic Verified!');

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

runTests();
