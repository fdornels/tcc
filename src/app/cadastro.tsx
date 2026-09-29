import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';

export default function CadastroScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function cadastrar() {
        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (
            !nomeLimpo ||
            !emailLimpo ||
            !senha ||
            !confirmarSenha
        ) {
            Alert.alert(
                'Campos obrigatórios',
                'Preencha todos os campos para continuar.'
            );
            return;
        }

        if (!emailLimpo.includes('@')) {
            Alert.alert(
                'E-mail inválido',
                'Digite um endereço de e-mail válido.'
            );
            return;
        }

        if (senha.length < 6) {
            Alert.alert(
                'Senha muito curta',
                'A senha deve possuir pelo menos 6 caracteres.'
            );
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert(
                'Senhas diferentes',
                'A confirmação da senha não corresponde à senha informada.'
            );
            return;
        }

        try {
            setCarregando(true);

            const credencial =
                await createUserWithEmailAndPassword(
                    auth,
                    emailLimpo,
                    senha
                );

            await updateProfile(credencial.user, {
                displayName: nomeLimpo,
            });

            Alert.alert(
                'Conta criada! 💙',
                `Bem-vinda ao TEAjudo, ${nomeLimpo}!`,
                [
                    {
                        text: 'Continuar',
                        onPress: () => router.replace('/home'),
                    },
                ]
            );
        } catch (erro: any) {
            console.log('Erro ao criar conta:', erro);

            let mensagem =
                'Não foi possível criar sua conta. Tente novamente.';

            if (erro?.code === 'auth/email-already-in-use') {
                mensagem =
                    'Já existe uma conta cadastrada com este e-mail.';
            } else if (erro?.code === 'auth/invalid-email') {
                mensagem =
                    'O endereço de e-mail informado não é válido.';
            } else if (erro?.code === 'auth/weak-password') {
                mensagem =
                    'Escolha uma senha mais forte para continuar.';
            } else if (erro?.code === 'auth/network-request-failed') {
                mensagem =
                    'Não foi possível conectar ao servidor. Verifique sua internet.';
            }

            Alert.alert('Não foi possível cadastrar', mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios' ? 'padding' : undefined
                }
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.cabecalho}>
                        <Pressable
                            style={styles.botaoVoltar}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.seta}>‹</Text>
                        </Pressable>

                        <Text style={styles.tituloCabecalho}>
                            Criar conta
                        </Text>

                        <View style={styles.espacoCabecalho} />
                    </View>

                    <View style={styles.logoArea}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoRosa}>(TE)</Text>
                            <Text style={styles.logoAzul}>AJUDO</Text>
                        </Text>

                        <Text style={styles.slogan}>
                            Apoio à maternidade atípica
                        </Text>

                        <Text style={styles.coracao}>♡</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.titulo}>
                            Vamos começar 💙
                        </Text>

                        <Text style={styles.descricao}>
                            Crie sua conta para organizar e acompanhar
                            informações importantes do dia a dia.
                        </Text>

                        <Text style={styles.label}>
                            Seu nome
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome"
                            placeholderTextColor="#9A9A9A"
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu e-mail"
                            placeholderTextColor="#9A9A9A"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text style={styles.label}>
                            Senha
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Crie uma senha"
                            placeholderTextColor="#9A9A9A"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                        />

                        <Text style={styles.dicaSenha}>
                            Use pelo menos 6 caracteres.
                        </Text>

                        <Text style={styles.label}>
                            Confirmar senha
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite a senha novamente"
                            placeholderTextColor="#9A9A9A"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            secureTextEntry
                            onSubmitEditing={cadastrar}
                        />

                        <Pressable
                            style={[
                                styles.botaoCadastrar,
                                carregando &&
                                styles.botaoCadastrarDesativado,
                            ]}
                            onPress={cadastrar}
                            disabled={carregando}
                        >
                            <Text style={styles.textoBotao}>
                                {carregando
                                    ? 'Criando conta...'
                                    : 'Criar conta'}
                            </Text>
                        </Pressable>

                        <View style={styles.loginArea}>
                            <Text style={styles.textoNormal}>
                                Já possui uma conta?{' '}
                            </Text>

                            <Pressable
                                onPress={() => router.back()}
                            >
                                <Text style={styles.entrar}>
                                    Entrar
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.decoracao}>
                        <Text style={styles.arcoIris}>🌈</Text>
                        <Text style={styles.infinito}>∞</Text>
                        <Text style={styles.estrela}>★</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF3FA',
    },

    flex: {
        flex: 1,
    },

    conteudo: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 25,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
        marginBottom: 8,
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

    tituloCabecalho: {
        flex: 1,
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },

    espacoCabecalho: {
        width: 36,
    },

    logoArea: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 18,
    },

    logo: {
        fontSize: 34,
        fontWeight: '800',
    },

    logoRosa: {
        color: '#FF7FA3',
    },

    logoAzul: {
        color: '#42A5D5',
    },

    slogan: {
        marginTop: 4,
        fontSize: 13,
        color: '#68747A',
    },

    coracao: {
        marginTop: 5,
        fontSize: 27,
        color: '#FF7FA3',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    titulo: {
        fontSize: 23,
        fontWeight: '700',
        color: '#424B54',
        textAlign: 'center',
    },

    descricao: {
        fontSize: 12,
        lineHeight: 17,
        color: '#7A858B',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 21,
    },

    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4C5960',
        marginBottom: 7,
    },

    input: {
        height: 50,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D9E7EC',
        borderRadius: 15,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#333333',
        marginBottom: 14,
    },

    dicaSenha: {
        color: '#8A969B',
        fontSize: 10,
        marginTop: -8,
        marginBottom: 13,
        marginLeft: 3,
    },

    botaoCadastrar: {
        backgroundColor: '#FF8FB1',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },

    botaoCadastrarDesativado: {
        opacity: 0.6,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    loginArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 21,
    },

    textoNormal: {
        color: '#707B80',
        fontSize: 13,
    },

    entrar: {
        color: '#42A5D5',
        fontSize: 13,
        fontWeight: '700',
    },

    decoracao: {
        height: 65,
        marginTop: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    arcoIris: {
        fontSize: 34,
    },

    infinito: {
        fontSize: 43,
        fontWeight: '700',
        color: '#75C89B',
    },

    estrela: {
        fontSize: 29,
        color: '#FFD75E',
    },
});