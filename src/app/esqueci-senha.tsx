
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
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

            await sendPasswordResetEmail(auth, emailLimpo);

            Alert.alert(
                'E-mail enviado! 💙',
                'Enviamos as instruções para redefinir sua senha. Verifique também a caixa de spam.',
                [
                    {
                        text: 'Voltar ao login',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
        } catch (erro: any) {
            console.log('Erro ao recuperar senha:', erro);

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

            Alert.alert('Não foi possível enviar', mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Formas decorativas do fundo */}
            <View pointerEvents="none" style={styles.fundoDecorativo}>
                <View style={styles.formaRosaSuperior} />
                <View style={styles.formaAzulSuperior} />
                <View style={styles.formaRosaInferior} />
                <View style={styles.formaAzulInferior} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios' ? 'padding' : undefined
                }
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cabeçalho */}
                    <View style={styles.cabecalho}>
                        <Pressable
                            style={styles.botaoVoltar}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color="#E46B98"
                            />
                        </Pressable>

                        <Text style={styles.tituloCabecalho}>
                            Recuperar senha
                        </Text>

                        <View style={styles.espacoCabecalho} />
                    </View>


                    {/* Card de apresentação */}
                    <View style={styles.cardApresentacao}>
                        <View style={styles.iconeApresentacao}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={30}
                                color="#DB6D99"
                            />
                        </View>

                        <View style={styles.textoApresentacao}>
                            <Text style={styles.tituloApresentacao}>
                                Esqueceu sua senha?
                            </Text>

                            <Text style={styles.descricaoApresentacao}>
                                Não se preocupe! Vamos te ajudar a
                                recuperar o acesso à sua conta.
                            </Text>
                        </View>

                        <Ionicons
                            name="heart-outline"
                            size={23}
                            color="#D879A0"
                        />
                    </View>

                    {/* Formulário */}
                    <View style={styles.cardFormulario}>
                        <Text style={styles.tituloFormulario}>
                            Redefinir senha
                        </Text>

                        <Text style={styles.descricaoFormulario}>
                            Informe o e-mail utilizado no cadastro.
                            Enviaremos um link para você criar uma
                            nova senha.
                        </Text>

                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <View style={styles.campoEmail}>
                            <Ionicons
                                name="mail-outline"
                                size={21}
                                color="#42A5D5"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu e-mail"
                                placeholderTextColor="#9BAAB4"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                            />
                        </View>

                        <Pressable
                            style={[
                                styles.botaoEnviar,
                                carregando && styles.botaoDesativado,
                            ]}
                            onPress={recuperarSenha}
                            disabled={carregando}
                        >
                            <Text style={styles.textoBotao}>
                                {carregando
                                    ? 'Enviando...'
                                    : 'Enviar instruções'}
                            </Text>

                            {!carregando && (
                                <Ionicons
                                    name="arrow-forward"
                                    size={19}
                                    color="#FFFFFF"
                                />
                            )}
                        </Pressable>

                        <Pressable
                            style={styles.botaoLogin}
                            onPress={() => router.replace('/login')}
                        >
                            <Ionicons
                                name="arrow-back-outline"
                                size={17}
                                color="#42A5D5"
                            />
                            <Text style={styles.voltarLogin}>
                                Voltar para o login
                            </Text>
                        </Pressable>
                    </View>

                    {/* Identidade visual */}
                    <View style={styles.rodape}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoRosa}>(TE)</Text>
                            <Text style={styles.logoAzul}>AJUDO</Text>
                        </Text>

                        <Text style={styles.slogan}>
                            Apoio à maternidade atípica
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
    },

    fundoDecorativo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
},

    formaRosaSuperior: {
        position: 'absolute',
        top: -115,
        left: -115,
        width: 320,
        height: 290,
        borderRadius: 145,
        backgroundColor: '#FCE8F0',
        transform: [{ rotate: '-22deg' }],
    },

    formaAzulSuperior: {
        position: 'absolute',
        top: -145,
        right: -125,
        width: 330,
        height: 280,
        borderRadius: 145,
        backgroundColor: '#E5F5FC',
        transform: [{ rotate: '18deg' }],
    },

    formaRosaInferior: {
        position: 'absolute',
        bottom: -145,
        left: -125,
        width: 350,
        height: 290,
        borderRadius: 145,
        backgroundColor: '#FCE8F0',
        transform: [{ rotate: '25deg' }],
    },

    formaAzulInferior: {
        position: 'absolute',
        bottom: -130,
        right: -125,
        width: 350,
        height: 290,
        borderRadius: 145,
        backgroundColor: '#E4F5FC',
        transform: [{ rotate: '-25deg' }],
    },

    conteudo: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 32,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },

    botaoVoltar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#355C6D',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    tituloCabecalho: {
        flex: 1,
        textAlign: 'center',
        color: '#30475D',
        fontSize: 21,
        fontWeight: '800',
    },

    espacoCabecalho: {
        width: 46,
    },

    cardApresentacao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F6',
        borderRadius: 26,
        paddingVertical: 22,
        paddingHorizontal: 16,
        marginBottom: 28,
        shadowColor: '#355C6D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
    },

    iconeApresentacao: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#FFE1EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },

    textoApresentacao: {
        flex: 1,
        paddingRight: 8,
    },

    tituloApresentacao: {
        color: '#30475D',
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 5,
    },

    descricaoApresentacao: {
        color: '#61788A',
        fontSize: 12,
        lineHeight: 18,
    },

    cardFormulario: {
        backgroundColor: '#FFFFFF',
        borderRadius: 26,
        padding: 22,
        borderWidth: 1,
        borderColor: '#EDF3F6',
        shadowColor: '#355C6D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },

    tituloFormulario: {
        color: '#30475D',
        fontSize: 21,
        fontWeight: '800',
        marginBottom: 9,
    },

    descricaoFormulario: {
        color: '#7A8C95',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 25,
    },

    label: {
        color: '#405565',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },

    campoEmail: {
        height: 55,
        backgroundColor: '#F8FCFE',
        borderWidth: 1,
        borderColor: '#DDEDF5',
        borderRadius: 17,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 22,
    },

    input: {
        flex: 1,
        height: '100%',
        marginLeft: 11,
        color: '#30475D',
        fontSize: 14,
    },

    botaoEnviar: {
        height: 55,
        backgroundColor: '#FF7FA3',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#FF7FA3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 3,
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    botaoLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        marginTop: 24,
        paddingVertical: 4,
    },

    voltarLogin: {
        color: '#42A5D5',
        fontSize: 14,
        fontWeight: '700',
    },

    rodape: {
        alignItems: 'center',
        marginTop: 38,
        marginBottom: 12,
    },

    logo: {
        fontSize: 25,
        fontWeight: '800',
    },

    logoRosa: {
        color: '#FF7FA3',
    },

    logoAzul: {
        color: '#42A5D5',
    },

    slogan: {
        marginTop: 5,
        fontSize: 11,
        color: '#7A8C95',
    },
});
