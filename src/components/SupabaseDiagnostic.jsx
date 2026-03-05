import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Database, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const SupabaseDiagnostic = () => {
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    const [dataCount, setDataCount] = useState(0);

    const testConnection = async () => {
        setStatus('loading');
        setMessage('');
        setDataCount(0);

        try {
            const { data, error, count } = await supabase
                .from('scheduled_posts')
                .select('*', { count: 'exact' })
                .limit(1);

            if (error) {
                setStatus('error');
                setMessage(error.message || error.code || 'Unknown error occurred.');
            } else {
                setStatus('success');
                setMessage('Connection Established!');
                setDataCount(count || 0);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'An unexpected error occurred during the request.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
            <div className="bg-slate-900 border-2 border-bit-blue/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
                <Database className="w-16 h-16 text-bit-blue mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-6">Supabase Diagnostic</h2>

                <button
                    onClick={testConnection}
                    disabled={status === 'loading'}
                    className="bg-bit-yellow text-bit-blue font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform duration-200 flex items-center justify-center mx-auto w-full disabled:opacity-50 disabled:hover:scale-100"
                >
                    {status === 'loading' ? (
                        <>
                            <Activity className="w-5 h-5 mr-2 animate-spin" />
                            Testing...
                        </>
                    ) : (
                        'Test Database Connection'
                    )}
                </button>

                {status === 'success' && (
                    <div className="mt-8 bg-green-900/40 border border-green-500/50 rounded-xl p-6 text-left">
                        <div className="flex items-start">
                            <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-green-400 font-bold text-lg mb-1">{message}</h3>
                                <p className="text-green-200 text-sm">
                                    Successfully connected to Supabase and queried the `scheduled_posts` table.
                                </p>
                                <div className="mt-3 inline-block bg-green-950 px-3 py-1 rounded-lg text-green-300 font-mono text-sm">
                                    Records Found: {dataCount}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-8 bg-red-900/40 border border-red-500/50 rounded-xl p-6 text-left">
                        <div className="flex items-start">
                            <AlertTriangle className="w-6 h-6 text-red-400 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-red-400 font-bold text-lg mb-1">Connection Failed</h3>
                                <p className="text-red-200 text-sm mb-3">
                                    There was an error communicating with the database. Please check your credentials, URL, or RLS policies.
                                </p>
                                <div className="bg-red-950 p-3 rounded-lg overflow-x-auto text-red-300 font-mono text-xs">
                                    {message}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupabaseDiagnostic;
