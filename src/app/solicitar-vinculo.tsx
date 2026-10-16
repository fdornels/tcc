import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';

export default function SolicitarVinculo() {
    const [codigo, setCodigo] = useState('');
    const [enviando, setEnviando] = useState(false);

    async function solicitarVinculo() {
    if (enviando) return;

    const codigoLimpo = codigo.trim().toUpperCase();

    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigoLimpo)) {
        Alert.alert(
            'Código inválido',
            'Digite o código no formato XXXX-XXXX.'
        );
        return;
    }

    try {
        setEnviando(true);

        const usuario = auth.currentUser;

        if (!usuario) {
            Alert.alert('Atenção', 'Faça login para continuar.');
            return;
        }

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/solicitar',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo: codigoLimpo,
                }),
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || 'Não foi possível solicitar o vínculo.'
            );
        }

        Alert.alert(
            'Solicitação enviada! 💙',
            'Agora é só aguardar a aprovação do responsável.',
            [
                {
                    text: 'Entendi',
                    onPress: () => router.back(),
                },
            ]
        );
    } catch (erro: any) {
        Alert.alert(
            'Erro',
            erro.message || 'Não foi possível enviar a solicitação.'
        );
    } finally {
        setEnviando(false);
    }
}

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.conteudo}>
                <Ionicons
                    name="link-outline"
                    size={45}
                    color="#42A5D5"
                />

                <Text style={styles.titulo}>
                    Vincular criança
                </Text>

                <Text style={styles.descricao}>
                    Digite o código fornecido pelo responsável
                    para solicitar o acompanhamento da criança.
                </Text>

                <TextInput
                    style={styles.campo}
                    placeholder="XXXX-XXXX"
                    placeholderTextColor="#A0AFB9"
                    value={codigo}
                    onChangeText={setCodigo}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={9}
                />

                <Pressable
                    style={styles.botao}
                    onPress={solicitarVinculo}
                    disabled={enviando}
                >
                    {enviando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.textoBotao}>
                            Solicitar vínculo
                        </Text>
                    )}
                </Pressable>

                <Text style={styles.aviso}>
                    O responsável precisará aprovar sua
                    solicitação antes que você possa acessar
                    as informações da criança.
                </Text>

                <Pressable onPress={() => router.back()}>
                    <Text style={styles.voltar}>Voltar</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
    },
    conteudo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
    },
    titulo: {
        fontSize: 23,
        fontWeight: '800',
        color: '#30475D',
        marginTop: 18,
    },
    descricao: {
        fontSize: 13,
        color: '#8196A3',
        textAlign: 'center',
        lineHeight: 21,
        marginTop: 12,
        marginBottom: 25,
    },
    campo: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DCECF3',
        borderRadius: 15,
        padding: 16,
        fontSize: 20,
        fontWeight: '700',
        color: '#30475D',
        textAlign: 'center',
        letterSpacing: 3,
    },
    botao: {
        width: '100%',
        backgroundColor: '#42A5D5',
        borderRadius: 15,
        padding: 17,
        alignItems: 'center',
        marginTop: 18,
    },
    textoBotao: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    aviso: {
        color: '#8196A3',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 19,
        marginTop: 22,
    },
    voltar: {
        color: '#E46B98',
        fontWeight: '700',
        marginTop: 28,
    },
});