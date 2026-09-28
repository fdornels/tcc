import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    function entrar() {
        router.replace('/home');
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
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
                    <Text style={styles.bemVindo}>Bem-vinda!</Text>
                    <Text style={styles.descricao}>
                        Entre na sua conta para continuar
                    </Text>

                    <Text style={styles.label}>E-mail</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu e-mail"
                        placeholderTextColor="#9A9A9A"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Senha</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor="#9A9A9A"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />

                    <Pressable style={styles.botaoEntrar} onPress={entrar}>
                        <Text style={styles.textoBotao}>Entrar</Text>
                    </Pressable>

                    <Pressable>
                        <Text style={styles.esqueciSenha}>
                            Esqueci minha senha
                        </Text>
                    </Pressable>

                    <View style={styles.cadastroArea}>
                        <Text style={styles.textoNormal}>
                            Ainda não tem uma conta?{' '}
                        </Text>

                        <Pressable>
                            <Text style={styles.cadastreSe}>Cadastre-se</Text>
                        </Pressable>
                    </View>
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

    logoArea: {
        alignItems: 'center',
        marginBottom: 25,
    },

    logo: {
        fontSize: 38,
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
        fontSize: 14,
        color: '#68747A',
    },

    coracao: {
        marginTop: 8,
        fontSize: 30,
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

    bemVindo: {
        fontSize: 25,
        fontWeight: '700',
        color: '#424B54',
        textAlign: 'center',
    },

    descricao: {
        fontSize: 14,
        color: '#7A858B',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 22,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4C5960',
        marginBottom: 7,
    },

    input: {
        height: 52,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D9E7EC',
        borderRadius: 15,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#333333',
        marginBottom: 16,
    },

    botaoEntrar: {
        backgroundColor: '#FF8FB1',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    esqueciSenha: {
        color: '#42A5D5',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 15,
    },

    cadastroArea: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },

    textoNormal: {
        color: '#707B80',
        fontSize: 13,
    },

    cadastreSe: {
        color: '#FF7FA3',
        fontSize: 13,
        fontWeight: '700',
    },

    decoracao: {
        height: 70,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    arcoIris: {
        fontSize: 37,
    },

    infinito: {
        fontSize: 47,
        fontWeight: '700',
        color: '#75C89B',
    },

    estrela: {
        fontSize: 30,
        color: '#FFD75E',
    },
});