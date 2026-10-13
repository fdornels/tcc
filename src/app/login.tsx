
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [exibirSenha, setExibirSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function entrar() {
        const emailLimpo = email.trim().toLowerCase();

        if (!emailLimpo || !senha) {
            Alert.alert(
                'Campos obrigatórios',
                'Digite seu e-mail e sua senha.'
            );
            return;
        }

        try {
            setCarregando(true);

            await signInWithEmailAndPassword(
                auth,
                emailLimpo,
                senha
            );

            router.replace('/home');
        } catch (erro: any) {
            console.log('Erro no login:', erro);

            let mensagem =
                'E-mail ou senha incorretos. Verifique os dados e tente novamente.';

            if (erro?.code === 'auth/invalid-email') {
                mensagem = 'Digite um endereço de e-mail válido.';
            } else if (
                erro?.code === 'auth/network-request-failed'
            ) {
                mensagem =
                    'Não foi possível conectar ao servidor. Verifique sua internet.';
            } else if (
                erro?.code === 'auth/too-many-requests'
            ) {
                mensagem =
                    'Muitas tentativas foram realizadas. Aguarde um pouco e tente novamente.';
            }

            Alert.alert('Não foi possível entrar', mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Fundo decorativo */}
            <View
                pointerEvents="none"
                style={styles.fundoDecorativo}
            >
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
                    {/* Identidade do TEAjudo */}
                    <View style={styles.apresentacao}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoRosa}>(TE)</Text>
                            <Text style={styles.logoAzul}>Ajudo</Text>
                        </Text>

                        <Text style={styles.slogan}>
                            Apoio à maternidade atípica
                        </Text>

                        <View style={styles.divisorDecorativo}>
                            <View style={styles.linhaDecorativa} />
                            <Ionicons
                                name="heart-outline"
                                size={18}
                                color="#FF8FB1"
                            />
                            <View style={styles.linhaDecorativa} />
                        </View>

                        <Text style={styles.boasVindas}>
                            Que bom ter você aqui!
                        </Text>

                        <Text style={styles.mensagem}>
                            Um cantinho de cuidado feito para você.
                        </Text>
                    </View>

                    {/* Formulário compacto */}
                    <View style={styles.cardFormulario}>
                        <Text style={styles.tituloFormulario}>
                            Entre na sua conta
                        </Text>

                        <Text style={styles.descricaoFormulario}>
                            Estamos felizes em te receber.
                        </Text>

                        <Text style={styles.label}>E-mail</Text>

                        <View style={styles.campo}>
                            <Ionicons
                                name="mail-outline"
                                size={18}
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

                        <Text style={styles.label}>Senha</Text>

                        <View style={styles.campo}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color="#42A5D5"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#9BAAB4"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry={!exibirSenha}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Pressable
                                style={styles.botaoOlho}
                                onPress={() =>
                                    setExibirSenha(!exibirSenha)
                                }
                                accessibilityLabel={
                                    exibirSenha
                                        ? 'Ocultar senha'
                                        : 'Exibir senha'
                                }
                            >
                                <Ionicons
                                    name={
                                        exibirSenha
                                            ? 'eye-off-outline'
                                            : 'eye-outline'
                                    }
                                    size={20}
                                    color="#8A9DA9"
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            style={[
                                styles.botaoEntrar,
                                carregando && styles.botaoDesativado,
                            ]}
                            onPress={entrar}
                            disabled={carregando}
                        >
                            <Text style={styles.textoBotao}>
                                {carregando ? 'Entrando...' : 'Entrar'}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.botaoEsqueci}
                            onPress={() =>
                                router.push('/esqueci-senha')
                            }
                        >
                            <Text style={styles.esqueciSenha}>
                                Esqueci minha senha
                            </Text>
                        </Pressable>

                        <View style={styles.divisor} />

                        <View style={styles.cadastroArea}>
                            <Text style={styles.textoNormal}>
                                Ainda não tem uma conta?{' '}
                            </Text>

                            <Pressable
                                onPress={() => router.push('/cadastro')}
                            >
                                <Text style={styles.cadastreSe}>
                                    Cadastre-se
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Rodapé */}
                    <View style={styles.rodape}>
                        <Ionicons
                            name="heart-outline"
                            size={15}
                            color="#FF8FB1"
                        />
                        <Text style={styles.textoRodape}>
                            Cuidar também é acolher
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
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 30,
    },

    apresentacao: {
        alignItems: 'center',
        marginBottom: 24,
    },

   logo: {
    fontSize: 37,
    fontWeight: '800',
    textAlign: 'center',
},

    logoRosa: {
        color: '#FF7FA3',
    },

    logoAzul: {
        color: '#42A5D5',
    },

    slogan: {
        marginTop: 5,
        fontSize: 12,
        color: '#7A8C95',
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    divisorDecorativo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 22,
        marginBottom: 18,
    },

    linhaDecorativa: {
        width: 35,
        height: 1,
        backgroundColor: '#F3DCE5',
    },

    boasVindas: {
        color: '#30475D',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
    },

    mensagem: {
        color: '#8496A0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 6,
    },

    cardFormulario: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: '#EDF3F6',
        shadowColor: '#355C6D',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },

    tituloFormulario: {
        color: '#30475D',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },

    descricaoFormulario: {
        color: '#8A9AA4',
        fontSize: 11,
        textAlign: 'center',
        marginBottom: 20,
    },

    label: {
        color: '#526573',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 7,
    },

    campo: {
        height: 45,
        backgroundColor: '#FAFCFD',
        borderWidth: 1,
        borderColor: '#E5EFF3',
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 15,
    },

    input: {
        flex: 1,
        height: '100%',
        marginLeft: 9,
        color: '#30475D',
        fontSize: 13,
    },

    botaoOlho: {
        padding: 6,
        marginLeft: 3,
    },

    botaoEntrar: {
        height: 45,
        backgroundColor: '#FF8FB1',
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
        shadowColor: '#FF8FB1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    botaoEsqueci: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 4,
    },

    esqueciSenha: {
        color: '#42A5D5',
        fontSize: 12,
        fontWeight: '600',
    },

    divisor: {
        height: 1,
        backgroundColor: '#F0F3F5',
        marginTop: 16,
        marginBottom: 16,
    },

    cadastroArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },

    textoNormal: {
        color: '#8A9AA4',
        fontSize: 11,
    },

    cadastreSe: {
        color: '#FF7FA3',
        fontSize: 11,
        fontWeight: '700',
    },

    rodape: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 20,
    },

    textoRodape: {
        color: '#8A9AA4',
        fontSize: 11,
    },
});
