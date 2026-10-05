import { Ionicons } from '@expo/vector-icons';
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
                    Segurança
                </Text>

                <View style={{ width: 36 }} />
            </View>
            <View style={styles.card}>
                <View style={styles.icone}>
                    <Ionicons
                        name="lock-closed-outline"
                        size={27}
                        color="#FF7FA3"
                    />
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
        backgroundColor: '#F9FCFD',
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
        alignItems: 'center',
    },

    icone: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
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
        backgroundColor: '#42A5D5',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
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
});