import { Redirect } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { auth, db } from '../../config/firebase';

export default function Index() {
    const [usuario, setUsuario] = useState<User | null>(null);
    const [destino, setDestino] = useState<
        '/login' | '/home' | '/area-profissional' | null
    >(null);

    useEffect(() => {
        let ativo = true;

        const cancelar = onAuthStateChanged(auth, async (usuarioAtual) => {
            if (!ativo) return;

            setUsuario(usuarioAtual);

            if (!usuarioAtual) {
                setDestino('/login');
                return;
            }

            try {
                const referencia = doc(
                    db,
                    'usuarios',
                    usuarioAtual.uid
                );

                const resultado = await getDoc(referencia);

                if (!ativo) return;

                if (
                    resultado.exists() &&
                    resultado.data().tipoConta === 'profissional'
                ) {
                    setDestino('/area-profissional');
                } else {
                    setDestino('/home');
                }
            } catch (erro) {
                console.log('Erro ao verificar usuário:', erro);

                if (ativo) {
                    setDestino('/login');
                }
            }
        });

        return () => {
            ativo = false;
            cancelar();
        };
    }, []);

    if (!destino) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#F9FCFD',
                }}
            >
                <ActivityIndicator
                    size="large"
                    color="#FF8FB1"
                />
            </View>
        );
    }

    return <Redirect href={destino} />;
}