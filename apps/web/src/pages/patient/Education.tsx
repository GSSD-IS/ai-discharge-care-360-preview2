import React from 'react';

const Education: React.FC = () => {
    const articles = [
        {
            title: "糖尿病飲食指南",
            tag: "飲食控制",
            image: "https://images.unsplash.com/photo-1543362906-ac1b96633e38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            readTime: "5 min"
        },
        {
            title: "如何預防高血壓復發？",
            tag: "日常照護",
            image: "https://images.unsplash.com/photo-1576091160550-21878bf9785c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            readTime: "3 min"
        },
        {
            title: "出院後用藥安全須知",
            tag: "用藥安全",
            image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            readTime: "8 min"
        }
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">衛教資訊</h2>

            <div className="space-y-6">
                {articles.map((art, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition">
                        <div className="h-32 overflow-hidden relative">
                            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition"></div>
                            <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg">
                                {art.tag}
                            </span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight">{art.title}</h3>
                            <div className="flex justify-between items-center text-xs text-slate-400">
                                <span><i className="far fa-clock mr-1"></i> {art.readTime} read</span>
                                <button className="text-sky-600 font-bold hover:underline">閱讀文章</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-indigo-50 p-6 rounded-2xl text-center">
                <i className="fas fa-video text-3xl text-indigo-500 mb-3"></i>
                <h3 className="font-bold text-indigo-900">需要影音教學？</h3>
                <p className="text-xs text-indigo-700 mt-1 mb-4">觀看專業護理師錄製的照護影片</p>
                <button className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    前往影音專區
                </button>
            </div>
        </div>
    );
};

export default Education;
