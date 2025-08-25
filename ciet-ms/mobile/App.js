import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, TextInput, Button, FlatList } from 'react-native';
import Constants from 'expo-constants';

const API = 'http://localhost:4000/api';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const load = async () => {
    try {
      const r = await fetch(`${API}/projects`, { headers: { 'x-user-role': 'admin' } });
      const json = await r.json();
      setProjects(json);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { load(); }, []);

  const createProject = async () => {
    try {
      await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
        body: JSON.stringify({ name, code })
      });
      setName(''); setCode('');
      load();
    } catch (e) { console.log(e); }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Constants.statusBarHeight, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 8 }}>CIEt Mobile (Demo)</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, flex: 1, marginRight: 8 }} />
        <TextInput placeholder="Code" value={code} onChangeText={setCode} style={{ borderWidth: 1, padding: 8, width: 120 }} />
      </View>
      <Button title="Create Project" onPress={createProject} />

      <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '500' }}>Projects</Text>
      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
            <Text>{item.name} — {item.code} — {String(item.active)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
