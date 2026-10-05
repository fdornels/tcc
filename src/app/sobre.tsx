import { Ionicons } from '@expo/vector-icons';
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
                    <View style={styles.iconeLogo}>
                        <Ionicons
                            name="heart-outline"
                            size={38}
                            color="#FF7FA3"
                        />
                    </View>

                    <Text style={styles.nomeApp}>
                        (TE)Ajudo
                    </Text>

                    <Text style={styles.subtitulo}>
                        Apoio à maternidade atípica
                    </Text>

                    <Text style={styles.descricao}>
                        O (TE)Ajudo foi criado para auxiliar responsáveis no acompanhamento da rotina e do desenvolvimento de crianças com TEA, reunindo informações importantes em um só lugar.
                    </Text>
                    <View style={styles.divisor} />

                    <View style={styles.secao}>
                        <View style={styles.tituloSecaoLinha}>
                            <Ionicons
                                name="flag-outline"
                                size={17}
                                color="#42A5D5"
                            />

                            <Text style={styles.tituloSecao}>
                                Nosso objetivo
                            </Text>
                        </View>

                        <Text style={styles.textoSecao}>
                            Facilitar a organização do dia a dia de responsáveis por crianças com TEA, oferecendo um espaço simples e acolhedor para registrar informações importantes, acompanhar a rotina e acessar conteúdos de orientação.
                        </Text>
                    </View>

                    <View style={styles.secao}>
                        <View style={styles.tituloSecaoLinha}>
                            <Ionicons
                                name="apps-outline"
                                size={17}
                                color="#FF7FA3"
                            />

                            <Text style={styles.tituloSecao}>
                                O que você encontra no (TE)Ajudo
                            </Text>
                        </View>

                        <Text style={styles.textoSecao}>
                            • Agenda para organizar compromissos{'\n'}
                            • Registro de atividades e momentos importantes{'\n'}
                            • Informações individuais da criança{'\n'}
                            • Orientações sobre diferentes temas relacionados ao TEA
                        </Text>
                    </View>

                    <View style={styles.secao}>
                        <View style={styles.tituloSecaoLinha}>
                            <Ionicons
                                name="people-outline"
                                size={17}
                                color="#42A5D5"
                            />

                            <Text style={styles.tituloSecao}>
                                Para quem é o (TE)Ajudo?
                            </Text>
                        </View>

                        <Text style={styles.textoSecao}>
                            O aplicativo foi pensado especialmente para responsáveis e familiares que participam da rotina de crianças com TEA e buscam uma forma prática de organizar informações e acompanhar o dia a dia.
                        </Text>
                    </View>

                    <View style={styles.secao}>
                        <View style={styles.tituloSecaoLinha}>
                            <Ionicons
                                name="information-circle-outline"
                                size={17}
                                color="#FF7FA3"
                            />

                            <Text style={styles.tituloSecao}>
                                Importante
                            </Text>
                        </View>

                        <Text style={styles.textoSecao}>
                            As orientações disponibilizadas no (TE)Ajudo possuem caráter informativo e de apoio. O aplicativo não substitui o acompanhamento de profissionais especializados.
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
    iconeLogo: {
        width: 68,
        height: 68,
        borderRadius: 22,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 10,
    },
    tituloSecaoLinha: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
});