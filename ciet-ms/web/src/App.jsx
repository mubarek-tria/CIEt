import React, { useEffect, useState } from 'react'

const API = 'http://localhost:4000/api';

function useFetch(path, role='admin') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => {
    setLoading(true);
    fetch(`${API}${path}`, { headers: { 'x-user-role': role } })
      .then(r => r.json())
      .then(setData).catch(setErr).finally(() => setLoading(false));
  }, [path, role]);
  return { data, loading, err };
}

export default function App() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [projectsKey, setProjectsKey] = useState(0);
  const { data: projects } = useFetch('/projects', 'admin');

  const createProject = async () => {
    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({ name, code })
    });
    setName(''); setCode('');
    setProjectsKey(k=>k+1);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>CIEt Dashboard (Demo)</h1>
      <section style={{ marginBottom: 20 }}>
        <h2>Create Project</h2>
        <input placeholder="Project Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Project Code" value={code} onChange={e=>setCode(e.target.value)} style={{ marginLeft: 8 }} />
        <button onClick={createProject} style={{ marginLeft: 8 }}>Create</button>
      </section>

      <section>
        <h2>Projects</h2>
        {!projects ? <p>Loading...</p> : (
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Name</th><th>Code</th><th>Active</th><th>Site</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.code}</td>
                  <td>{String(p.active)}</td>
                  <td>{p.siteUrl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
