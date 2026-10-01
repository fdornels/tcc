import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../config/firebase';

export default function SegurancaScreen() {
    async function redefinirSenha() {
        const email = auth.currentUser?.email;

        if (!email) {
            Alert.alert(
                'Erro',
                'Não foi possível identificar o e-mail da sua conta.'
            );
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);

            Alert.alert(
                'E-mail enviado',
                'Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.'
            );
        } catch (erro) {
            console.log(
                'Erro ao enviar redefinição de senha:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível enviar o e-mail de redefinição de senha.'
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
                    Segurança
                </Text>

                <View style={{ width: 36 }} />
            </View>
            <View style={styles.card}>
                <View style={styles.icone}>
                    <Text style={styles.emoji}>🔒</Text>
                </View>

                <Text style={styles.tituloCard}>
                    Alterar senha
                </Text>

                <Text style={styles.descricao}>
                    Enviaremos um link para o e-mail da sua conta para você criar uma nova senha.
                </Text>

                <Pressable
                    style={styles.botao}
                    onPress={redefinirSenha}
                >
                    <Text style={styles.textoBotao}>
                        Enviar link de redefinição
                    </Text>
                </Pressable>
            </View>
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
        padding: 20,
        marginTop: 30,
        alignItems: 'center',
    },

    icone: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#FFF1C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    emoji: {
        fontSize: 27,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 8,
    },

    descricao: {
        color: '#7D8B91',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },

    botao: {
        width: '100%',
        height: 52,
        backgroundColor: '#4288AF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});