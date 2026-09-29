import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';

export default function EsqueciSenhaScreen() {
    const [email, setEmail] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function recuperarSenha() {
        const emailLimpo = email.trim().toLowerCase();

        if (!emailLimpo) {
            Alert.alert(
                'Informe seu e-mail',
                'Digite o e-mail utilizado no cadastro.'
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

        try {
            setCarregando(true);

            await sendPasswordResetEmail(
                auth,
                emailLimpo
            );

            Alert.alert(
                'E-mail enviado! 💙',
                'Enviamos as instruções para redefinir sua senha. Verifique também a caixa de spam.',
                [
                    {
                        text: 'Voltar ao login',
                        onPress: () =>
                            router.replace('/login'),
                    },
                ]
            );
        } catch (erro: any) {
            console.log(
                'Erro ao recuperar senha:',
                erro
            );

            let mensagem =
                'Não foi possível enviar o e-mail. Tente novamente.';

            if (erro?.code === 'auth/invalid-email') {
                mensagem =
                    'O endereço de e-mail informado não é válido.';
            } else if (
                erro?.code === 'auth/network-request-failed'
            ) {
                mensagem =
                    'Não foi possível conectar ao servidor. Verifique sua internet.';
            } else if (
                erro?.code === 'auth/too-many-requests'
            ) {
                mensagem =
                    'Foram feitas muitas tentativas. Aguarde um pouco e tente novamente.';
            }

            Alert.alert(
                'Não foi possível enviar',
                mensagem
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.content}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <View style={styles.cabecalho}>
                    <Pressable
                        style={styles.botaoVoltar}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.tituloCabecalho}>
                        Recuperar senha
                    </Text>

                    <View style={styles.espacoCabecalho} />
                </View>

                <View style={styles.logoArea}>
                    <Text style={styles.logo}>
                        <Text style={styles.logoRosa}>
                            (TE)
                        </Text>

                        <Text style={styles.logoAzul}>
                            AJUDO
                        </Text>
                    </Text>

                    <Text style={styles.slogan}>
                        Apoio à maternidade atípica
                    </Text>

                    <Text style={styles.coracao}>
                        ♡
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.icone}>
                        🔐
                    </Text>

                    <Text style={styles.titulo}>
                        Esqueceu sua senha?
                    </Text>

                    <Text style={styles.descricao}>
                        Informe o e-mail utilizado no
                        cadastro. Enviaremos as instruções
                        para você criar uma nova senha.
                    </Text>

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

                    <Pressable
                        style={[
                            styles.botaoEnviar,
                            carregando &&
                            styles.botaoDesativado,
                        ]}
                        onPress={recuperarSenha}
                        disabled={carregando}
                    >
                        <Text style={styles.textoBotao}>
                            {carregando
                                ? 'Enviando...'
                                : 'Enviar instruções'}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.replace('/login')
                        }
                    >
                        <Text style={styles.voltarLogin}>
                            Voltar para o login
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.decoracao}>
                    <Text style={styles.arcoIris}>🌈</Text>
                    <Text style={styles.infinito}>∞</Text>
                    <Text style={styles.estrela}>★</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF3FA',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
        textAlign: 'center',
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
    },

    espacoCabecalho: {
        width: 36,
    },

    logoArea: {
        alignItems: 'center',
        marginBottom: 22,
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
        marginTop: 6,
        fontSize: 28,
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

    icone: {
        fontSize: 37,
        textAlign: 'center',
        marginBottom: 10,
    },

    titulo: {
        color: '#424B54',
        fontSize: 23,
        fontWeight: '700',
        textAlign: 'center',
    },

    descricao: {
        color: '#7A858B',
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        marginTop: 7,
        marginBottom: 23,
    },

    label: {
        color: '#4C5960',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 7,
    },

    input: {
        height: 52,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D9E7EC',
        borderRadius: 15,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#333333',
        marginBottom: 17,
    },

    botaoEnviar: {
        height: 52,
        backgroundColor: '#FF8FB1',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    voltarLogin: {
        color: '#42A5D5',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 18,
    },

    decoracao: {
        height: 70,
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    arcoIris: {
        fontSize: 35,
    },

    infinito: {
        fontSize: 44,
        fontWeight: '700',
        color: '#75C89B',
    },

    estrela: {
        fontSize: 29,
        color: '#FFD75E',
    },
});