
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
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

import { doc, setDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function CadastroScreen() {
    const [nome, setNome] = useState('');
    const [tipoConta, setTipoConta] = useState<
    'responsavel' | 'profissional'
>('responsavel');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [exibirSenha, setExibirSenha] = useState(false);
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
            await setDoc(
    doc(db, 'usuarios', credencial.user.uid),
    {
        nome: nomeLimpo,
        email: emailLimpo,
        tipoConta: tipoConta,
        profissionalVerificado: false,
    },
    { merge: true }
);

            Alert.alert(
                'Conta criada! 💙',
                `Que bom ter você no TEAjudo, ${nomeLimpo}!`,
                [
                    {
                        text: 'Continuar',
                        onPress: () => {
    if (tipoConta === 'profissional') {
        router.replace('/area-profissional');
    } else {
        router.replace('/home');
    }
},
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
            } else if (
                erro?.code === 'auth/network-request-failed'
            ) {
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
            {/* Formas decorativas */}
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
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Voltar */}
                    <View style={styles.cabecalho}>
                        <Pressable
                            style={styles.botaoVoltar}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color="#E46B98"
                            />
                        </Pressable>

                        <Text style={styles.tituloCabecalho}>
                            Criar conta
                        </Text>

                        <View style={styles.espacoCabecalho} />
                    </View>

                    {/* Identidade do TEAjudo */}
                    <View style={styles.apresentacao}>
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

                        <View style={styles.divisorDecorativo}>
                            <View style={styles.linhaDecorativa} />
                            <Ionicons
                                name="heart-outline"
                                size={17}
                                color="#FF8FB1"
                            />
                            <View style={styles.linhaDecorativa} />
                        </View>

                        <Text style={styles.boasVindas}>
                            Que bom ter você aqui!
                        </Text>

                        <Text style={styles.mensagem}>
                            Um espaço de cuidado começa aqui.
                        </Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.cardFormulario}>
                        <Text style={styles.label}>
    Como você deseja utilizar o (TE)Ajudo?
</Text>

<View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
    <Pressable
        onPress={() => setTipoConta('responsavel')}
        style={{
            flex: 1,
            paddingVertical: 15,
            borderRadius: 13,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor:
                tipoConta === 'responsavel' ? '#FF8FB1' : '#E5EFF3',
            backgroundColor:
                tipoConta === 'responsavel' ? '#FFF0F5' : '#FAFCFD',
        }}
    >
        <Ionicons
            name="heart-outline"
            size={23}
            color="#E46B98"
        />
        <Text style={{ color: '#30475D', marginTop: 6, fontWeight: '600' }}>
            Responsável
        </Text>
    </Pressable>

    <Pressable
        onPress={() => setTipoConta('profissional')}
        style={{
            flex: 1,
            paddingVertical: 15,
            borderRadius: 13,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor:
                tipoConta === 'profissional' ? '#42A5D5' : '#E5EFF3',
            backgroundColor:
                tipoConta === 'profissional' ? '#EBF8FF' : '#FAFCFD',
        }}
    >
        <Ionicons
            name="medkit-outline"
            size={23}
            color="#42A5D5"
        />
        <Text style={{ color: '#30475D', marginTop: 6, fontWeight: '600' }}>
            Profissional
        </Text>
    </Pressable>
</View>

                        <Text style={styles.label}>
                            Seu nome
                        </Text>

                        <View style={styles.campo}>
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color="#42A5D5"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu nome"
                                placeholderTextColor="#9BAAB4"
                                value={nome}
                                onChangeText={setNome}
                                autoCapitalize="words"
                                autoCorrect={false}
                                autoComplete="name"
                            />
                        </View>

                        <Text style={styles.label}>
                            E-mail
                        </Text>

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

                        <Text style={styles.label}>
                            Senha
                        </Text>

                        <View style={styles.campo}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color="#42A5D5"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Crie uma senha"
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
                                        ? 'Ocultar senhas'
                                        : 'Exibir senhas'
                                }
                            >
                                <Ionicons
                                    name={
                                        exibirSenha
                                            ? 'eye-off-outline'
                                            : 'eye-outline'
                                    }
                                    size={19}
                                    color="#8A9DA9"
                                />
                            </Pressable>
                        </View>

                        <Text style={styles.dicaSenha}>
                            Use pelo menos 6 caracteres.
                        </Text>

                        <Text style={styles.label}>
                            Confirmar senha
                        </Text>

                        <View style={styles.campo}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={18}
                                color="#42A5D5"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Digite a senha novamente"
                                placeholderTextColor="#9BAAB4"
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                                secureTextEntry={!exibirSenha}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <Pressable
                            style={[
                                styles.botaoCadastrar,
                                carregando &&
                                    styles.botaoDesativado,
                            ]}
                            onPress={cadastrar}
                            disabled={carregando}
                        >
                            <Text style={styles.textoBotao}>
                                {carregando
                                    ? 'Criando conta...'
                                    : 'Criar minha conta'}
                            </Text>
                        </Pressable>

                        <View style={styles.divisor} />

                        <View style={styles.loginArea}>
                            <Text style={styles.textoNormal}>
                                Já possui uma conta?{' '}
                            </Text>

                            <Pressable
                                onPress={() =>
                                    router.replace('/login')
                                }
                            >
                                <Text style={styles.entrar}>
                                    Entrar
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
        paddingHorizontal: 28,
        paddingTop: 15,
        paddingBottom: 28,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    botaoVoltar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#355C6D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },

    tituloCabecalho: {
        flex: 1,
        textAlign: 'center',
        color: '#30475D',
        fontSize: 18,
        fontWeight: '700',
    },

    espacoCabecalho: {
        width: 40,
    },

    apresentacao: {
        alignItems: 'center',
        marginBottom: 18,
    },

    logo: {
        fontSize: 32,
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
        marginTop: 4,
        fontSize: 12,
        color: '#7A8C95',
        textAlign: 'center',
    },

    divisorDecorativo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 15,
        marginBottom: 12,
    },

    linhaDecorativa: {
        width: 35,
        height: 1,
        backgroundColor: '#F3DCE5',
    },

    boasVindas: {
        color: '#30475D',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },

    mensagem: {
        color: '#8496A0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    },

    cardFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 22,
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
        marginBottom: 18,
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

    dicaSenha: {
        color: '#8A9AA4',
        fontSize: 10,
        marginTop: -9,
        marginBottom: 13,
        marginLeft: 3,
    },

    botaoCadastrar: {
        height: 45,
        backgroundColor: '#FF8FB1',
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
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

    divisor: {
        height: 1,
        backgroundColor: '#F0F3F5',
        marginTop: 19,
        marginBottom: 16,
    },

    loginArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },

    textoNormal: {
        color: '#8A9AA4',
        fontSize: 11,
    },

    entrar: {
        color: '#42A5D5',
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
