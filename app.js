import React, { useState } from 'react';
import { 
  View, Text, TextInput, Switch, TouchableOpacity, 
  FlatList, StyleSheet, SafeAreaView, Alert, Linking 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MotoNavApp() {
  const [nomeRota, setNomeRota] = useState('Viagem Galiza 2026');
  const [etapas, setEtapas] = useState([
    { id: '1', local: '', evitarAutoestrada: true, tipo: 'PARTIDA' },
    { id: '2', local: '', evitarAutoestrada: true, tipo: 'DESTINO' }
  ]);

  const adicionarParagem = () => {
    const novasEtapas = [...etapas];
    novasEtapas.splice(etapas.length - 1, 0, { 
      id: Math.random().toString(), 
      local: '', 
      evitarAutoestrada: true, 
      tipo: 'PARAGEM' 
    });
    setEtapas(novasEtapas);
  };

  const atualizarEtapa = (id, campo, valor) => {
    setEtapas(etapas.map(e => e.id === id ? { ...e, [campo]: valor } : e));
  };

  const iniciarNavegacao = (app) => {
    const destinoFinal = etapas[etapas.length - 1].local;
    if (!destinoFinal) {
      Alert.alert("Erro", "Define pelo menos um destino final.");
      return;
    }

    const pontoA = etapas[0].local ? encodeURIComponent(etapas[0].local) : "My+Location";
    const pontoB = encodeURIComponent(destinoFinal);
    
    const paragens = etapas.slice(1, -1)
      .filter(e => e.local !== '')
      .map(e => encodeURIComponent(e.local))
      .join('|');

    const evitar = etapas.some(e => e.evitarAutoestrada) ? "&avoid=highways,tolls" : "";

    let url = '';
    if (app === 'google') {
      url = "https://www.google.com/maps/dir/?api=1&origin=" + pontoA + "&destination=" + pontoB + "&waypoints=" + paragens + evitar + "&travelmode=driving";
    } else {
      url = "https://www.waze.com/ul?q=" + pontoB + "&navigate=yes";
    }

    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o GPS."));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>MotoPlanner Pro 🏍️</Text>
        <TextInput 
          style={styles.inputNome} 
          value={nomeRota} 
          onChangeText={setNomeRota} 
          placeholder="Nome da Rota"
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={etapas}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.card, item.tipo === 'PARTIDA' ? styles.cardPartida : item.tipo === 'DESTINO' ? styles.cardDestino : null]}>
            <Text style={styles.label}>{item.tipo} {item.tipo === 'PARAGEM' ? index : ''}</Text>
            <TextInput
              style={styles.inputLocal}
              placeholder={item.tipo === 'PARTIDA' ? "A minha localização (GPS)" : "Cidade ou Morada"}
              placeholderTextColor="#888"
              value={item.local}
              onChangeText={(t) => atualizarEtapa(item.id, 'local', t)}
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Evitar Autoestradas</Text>
              <Switch
                trackColor={{ false: "#444", true: "#ff9900" }}
                value={item.evitarAutoestrada}
                onValueChange={(v) => atualizarEtapa(item.id, 'evitarAutoestrada', v)}
              />
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecundario} onPress={adicionarParagem}>
          <Text style={styles.btnText}>+ ADICIONAR PARAGEM INTERMÉDIA</Text>
        </TouchableOpacity>

        <View style={styles.navButtonsRow}>
          <TouchableOpacity style={[styles.btnNav, {backgroundColor: '#4285F4'}]} onPress={() => iniciarNavegacao('google')}>
            <Text style={styles.btnText}>GOOGLE MAPS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnNav, {backgroundColor: '#33CCFF'}]} onPress={() => iniciarNavegacao('waze')}>
            <Text style={styles.btnText}>WAZE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20 },
  header: { marginBottom: 20, marginTop: 40 },
  titulo: { color: '#ff9900', fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  inputNome: { color: '#fff', borderBottomWidth: 1, borderColor: '#444', fontSize: 18, marginTop: 10, textAlign: 'center' },
  card: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 12, marginBottom: 12 },
  cardPartida: { borderLeftWidth: 6, borderLeftColor: '#2ecc71' },
  cardDestino: { borderLeftWidth: 6, borderLeftColor: '#e74c3c' },
  label: { color: '#ff9900', fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  inputLocal: { backgroundColor: '#2a2a2a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchText: { color: '#888', fontSize: 13 },
  footer: { paddingBottom: 20 },
  navButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnSecundario: { borderWidth: 1, borderColor: '#444', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnNav: { flex: 0.48, padding: 18, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
