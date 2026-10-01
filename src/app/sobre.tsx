import { router } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SobreScreen() {
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
                    Sobre o TEAjudo
                </Text>

                <View style={{ width: 36 }} />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >
                <View style={styles.card}>
                    <Text style={styles.logo}>💙</Text>

                    <Text style={styles.nomeApp}>
                        TEAjudo
                    </Text>

                    <Text style={styles.subtitulo}>
                        Apoio à maternidade atípica
                    </Text>

                    <Text style={styles.descricao}>
                        O TEAjudo foi criado para auxiliar responsáveis no acompanhamento da rotina e do desenvolvimento de crianças com TEA, reunindo informações importantes em um só lugar.
                    </Text>
                    <View style={styles.divisor} />

                    <View style={styles.secao}>
                        <Text style={styles.tituloSecao}>
                            💙 Nosso objetivo
                        </Text>

                        <Text style={styles.textoSecao}>
                            Facilitar a organização do dia a dia de responsáveis por crianças com TEA, oferecendo um espaço simples e acolhedor para registrar informações importantes, acompanhar a rotina e acessar conteúdos de orientação.
                        </Text>
                    </View>

                    <View style={styles.secao}>
                        <Text style={styles.tituloSecao}>
                            🧩 O que você encontra no TEAjudo
                        </Text>

                        <Text style={styles.textoSecao}>
                            • Agenda para organizar compromissos{'\n'}
                            • Registro de atividades e momentos importantes{'\n'}
                            • Informações individuais da criança{'\n'}
                            • Orientações sobre diferentes temas relacionados ao TEA
                        </Text>
                    </View>

                    <View style={styles.secao}>
                        <Text style={styles.tituloSecao}>
                            🌈 Para quem é o TEAjudo?
                        </Text>

                        <Text style={styles.textoSecao}>
                            O aplicativo foi pensado especialmente para responsáveis e familiares que participam da rotina de crianças com TEA e buscam uma forma prática de organizar informações e acompanhar o dia a dia.
                        </Text>
                    </View>

                    <View style={styles.secao}>
                        <Text style={styles.tituloSecao}>
                            ⭐ Importante
                        </Text>

                        <Text style={styles.textoSecao}>
                            As orientações disponibilizadas no TEAjudo possuem caráter informativo e de apoio. O aplicativo não substitui o acompanhamento de profissionais especializados.
                        </Text>
                    </View>

                    <Text style={styles.versao}>
                        TEAjudo • versão 1.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView >
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
        padding: 22,
        marginTop: 30,
        alignItems: 'center',
    },

    logo: {
        fontSize: 42,
        marginBottom: 8,
    },

    nomeApp: {
        color: '#40515A',
        fontSize: 22,
        fontWeight: '700',
    },

    subtitulo: {
        color: '#4288AF',
        fontSize: 12,
        marginTop: 4,
    },

    descricao: {
        color: '#6F7E85',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 20,
    },
    divisor: {
        width: '100%',
        height: 1,
        backgroundColor: '#EDF1F2',
        marginVertical: 20,
    },

    secao: {
        width: '100%',
        marginBottom: 20,
    },

    tituloSecao: {
        color: '#46545B',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 7,
    },

    textoSecao: {
        color: '#6F7E85',
        fontSize: 12,
        lineHeight: 19,
    },

    versao: {
        color: '#91A0A5',
        fontSize: 10,
        marginTop: 2,
    },
    conteudo: {
        paddingBottom: 30,
    },
});