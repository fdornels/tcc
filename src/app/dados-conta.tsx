import { Ionicons } from '@expo/vector-icons';
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
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
            <View style={styles.cabecalho}>
                <Pressable
                    style={styles.botaoVoltar}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color="#42A5D5"
                    />
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
        backgroundColor: '#F9FCFD',
        paddingHorizontal: 20,
    },
    decoracaoFundo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },

    manchaRosaTopo: {
        position: 'absolute',
        width: 270,
        height: 210,
        borderRadius: 140,
        backgroundColor: '#FFE8F0',
        top: -105,
        left: -85,
        opacity: 0.85,
    },

    manchaAzulTopo: {
        position: 'absolute',
        width: 290,
        height: 210,
        borderRadius: 150,
        backgroundColor: '#E2F5FC',
        top: -115,
        right: -100,
        opacity: 0.9,
    },

    manchaRosaBaixo: {
        position: 'absolute',
        width: 350,
        height: 230,
        borderRadius: 180,
        backgroundColor: '#FFE5EE',
        bottom: -110,
        left: -130,
        opacity: 0.8,
    },

    manchaAzulBaixo: {
        position: 'absolute',
        width: 360,
        height: 230,
        borderRadius: 190,
        backgroundColor: '#DCF3FC',
        bottom: -120,
        right: -150,
        opacity: 0.85,
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
        backgroundColor: '#42A5D5',
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