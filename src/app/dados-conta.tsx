import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';

export default function DadosContaScreen() {
    const [nome, setNome] = useState(
        auth.currentUser?.displayName || ''
    );
    async function salvarAlteracoes() {
        const usuario = auth.currentUser;

        if (!usuario) {
            return;
        }

        if (!nome.trim()) {
            return;
        }

        try {
            await updateProfile(usuario, {
                displayName: nome.trim(),
            });

            Alert.alert(
                'Sucesso',
                'Nome atualizado com sucesso!'
            );
        } catch (erro) {
            console.log(
                'Erro ao atualizar nome:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível atualizar o nome.'
            );
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.cabecalho}>
                <Pressable
                    style={styles.botaoVoltar}
                    onPress={() => router.back()}
                >
                    <Text style={styles.seta}>‹</Text>
                </Pressable>

                <Text style={styles.titulo}>
                    Dados da conta
                </Text>

                <View style={{ width: 36 }} />
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Nome</Text>

                <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Digite seu nome"
                />
                <Text style={[styles.label, { marginTop: 18 }]}>
                    E-mail
                </Text>

                <View style={styles.emailBox}>
                    <Text style={styles.emailTexto}>
                        {auth.currentUser?.email || 'E-mail não disponível'}
                    </Text>
                </View>
            </View>
            <Pressable
                style={styles.botaoSalvar}
                onPress={salvarAlteracoes}
            >
                <Text style={styles.textoBotaoSalvar}>
                    Salvar alterações
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF3FA',
        paddingHorizontal: 20,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
    },

    botaoVoltar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    seta: {
        color: '#4288AF',
        fontSize: 30,
        lineHeight: 31,
    },

    titulo: {
        flex: 1,
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginTop: 30,
    },

    label: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
    },

    input: {
        height: 50,
        backgroundColor: '#F5F9FA',
        borderRadius: 14,
        paddingHorizontal: 15,
        color: '#40515A',
        fontSize: 14,
    },
    emailBox: {
        height: 50,
        backgroundColor: '#EDF1F2',
        borderRadius: 14,
        paddingHorizontal: 15,
        justifyContent: 'center',
    },

    emailTexto: {
        color: '#7D8B91',
        fontSize: 14,
    },
    botaoSalvar: {
        height: 52,
        backgroundColor: '#4288AF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
    },

    textoBotaoSalvar: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});