import React from 'react';

const RBACSettings: React.FC = () => {
    const roles = [
        { name: 'Physician', permissions: ['view_all', 'approve_plan', 'override_ai', 'prescribe'] },
        { name: 'Case Manager', permissions: ['view_all', 'edit_plan', 'submit_claims', 'manage_bed'] },
        { name: 'Nurse', permissions: ['view_ward', 'edit_vitals', 'fill_assessment'] },
        { name: 'Social Worker', permissions: ['view_social', 'fill_social_assessment', 'referral_agencies'] },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-6">角色權限設定 (RBAC Configuration)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map(role => (
                    <div key={role.name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">{role.name}</h3>
                            <button className="text-indigo-600 text-xs font-bold hover:underline">Edit Permissions</button>
                        </div>
                        <div className="space-y-2">
                            {role.permissions.map(perm => (
                                <div key={perm} className="flex items-center gap-2 text-sm text-slate-600">
                                    <i className="fas fa-check text-green-500"></i>
                                    <code>{perm}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <i className="fas fa-info-circle text-yellow-600 mt-1"></i>
                <div>
                    <h4 className="font-bold text-yellow-800 text-sm">Advanced Configuration</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                        To create custom roles or modify default policies, please contact your Super Admin or edit the `acl.json` configuration file directly via API.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RBACSettings;
