import { router, Stack, useSegments } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { auth } from '../../config/firebase';

export default function RootLayout() {
  const segments = useSegments();

  const [usuario, setUsuario] =
    useState<User | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    const cancelarObservacao =
      onAuthStateChanged(
        auth,
        (usuarioAtual) => {
          setUsuario(usuarioAtual);
          setCarregando(false);
        }
      );

    return cancelarObservacao;
  }, []);

  useEffect(() => {
    if (carregando) {
      return;
    }

    const rotaAtual = segments[0];

    const rotaPublica =
      rotaAtual === 'login' ||
      rotaAtual === 'cadastro' ||
      rotaAtual === 'esqueci-senha';

    // Usuário NÃO está logado
    if (!usuario && !rotaPublica) {
      router.replace('/login');
      return;
    }

    // Usuário ESTÁ logado e tenta voltar
    // para uma tela de autenticação
    if (usuario && rotaPublica) {
      router.replace('/home');
    }
  }, [usuario, carregando, segments]);

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator
          size="large"
          color="#42A5D5"
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    backgroundColor: '#DDF3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});