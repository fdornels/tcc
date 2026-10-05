import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

export default function AdminScreen() {
    const [verificando, setVerificando] = useState(true);
    const [ehAdmin, setEhAdmin] = useState(false);

    async function verificarAdmin() {
        try {
            setVerificando(true);

            const usuario = auth.currentUser;

            if (!usuario) {
                setEhAdmin(false);
                router.replace('/login');
                return;
            }

            const documento = await getDoc(
                doc(db, 'usuarios', usuario.uid)
            );

            const admin =
                documento.exists() &&
                documento.data().admin === true;

            setEhAdmin(admin);

            if (!admin) {
                router.replace('/home');
            }
        } catch (erro) {
            console.log(
                'Erro ao verificar administrador:',
                erro
            );

            setEhAdmin(false);
            router.replace('/home');
        } finally {
            setVerificando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            verificarAdmin();
        }, [])
    );

    if (verificando || !ehAdmin) {
        return (
            <SafeAreaView style={styles.container}>
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 12 }}>
                        Verificando acesso...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >
                {/* Cabeçalho */}
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

                    <Text style={styles.tituloCabecalho}>
                        Administração
                    </Text>

                    <View style={{ width: 36 }} />
                </View>

                {/* Boas-vindas */}
                <View style={styles.boasVindas}>
                    <View style={styles.iconeAdmin}>
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={28}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.textoBoasVindas}>
                        <Text style={styles.tituloBoasVindas}>
                            Olá, Administrador
                        </Text>

                        <Text style={styles.subtituloBoasVindas}>
                            Gerencie os conteúdos e informações do TEAjudo.
                        </Text>
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.tituloSecao}>
                    Painel administrativo
                </Text>

                {/* Gerenciar orientações */}
                <Pressable
                    style={styles.cardPrincipal}
                    onPress={() => router.push('/admin-orientacoes')}
                >
                    <View style={[styles.iconeCard, styles.fundoAzul]}>
                        <Ionicons
                            name="library-outline"
                            size={25}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.conteudoCard}>
                        <Text style={styles.tituloCard}>
                            Gerenciar orientações
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Cadastre, edite ou exclua conteúdos disponíveis
                            para os responsáveis.
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={19}
                        color="#42A5D5"
                    />
                </Pressable>
                {/* Crianças cadastradas */}
                <Pressable
                    style={styles.cardPrincipal}
                    onPress={() => router.push('/admin-criancas')}
                >
                    <View style={[styles.iconeCard, styles.fundoRosa]}>
                        <Ionicons
                            name="people-outline"
                            size={25}
                            color="#FF7FA3"
                        />
                    </View>

                    <View style={styles.conteudoCard}>
                        <Text style={styles.tituloCard}>
                            Crianças cadastradas
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Consulte as crianças cadastradas pelos responsáveis.
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={19}
                        color="#42A5D5"
                    />
                </Pressable>
                {/* Visualizar aplicativo */}
                <Pressable
                    style={styles.cardPrincipal}
                    onPress={() => router.push('/orientacoes')}
                >
                    <View style={[styles.iconeCard, styles.fundoAzul]}>
                        <Ionicons
                            name="eye-outline"
                            size={25}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.conteudoCard}>
                        <Text style={styles.tituloCard}>
                            Visualizar orientações
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Veja como os conteúdos aparecem para o responsável.
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={19}
                        color="#42A5D5"
                    />
                </Pressable>

                {/* Informações */}
                <View style={styles.cardInformacao}>
                    <View style={styles.iconeInformacao}>
                        <Ionicons
                            name="information-circle-outline"
                            size={21}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.textoInformacao}>
                        <Text style={styles.tituloInformacao}>
                            Área administrativa
                        </Text>

                        <Text style={styles.descricaoInformacao}>
                            As alterações realizadas nas orientações serão
                            disponibilizadas na área do responsável.
                        </Text>
                    </View>
                </View>

                {/* Resumo */}
                <Text style={styles.tituloSecao}>
                    Resumo
                </Text>

                <View style={styles.resumo}>
                    <View style={styles.cardResumo}>
                        <Text style={styles.numeroResumo}>12</Text>
                        <Text style={styles.textoResumo}>
                            Orientações
                        </Text>
                    </View>

                    <View style={styles.cardResumo}>
                        <Text style={styles.numeroResumo}>4</Text>
                        <Text style={styles.textoResumo}>
                            Categorias
                        </Text>
                    </View>
                </View>


            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
    },

    conteudo: {
        paddingHorizontal: 18,
        paddingBottom: 35,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 22,
    },

    botaoVoltar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },



    tituloCabecalho: {
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
    },



    boasVindas: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },

    iconeAdmin: {
        width: 62,
        height: 62,
        borderRadius: 20,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },

    textoBoasVindas: {
        flex: 1,
    },

    tituloBoasVindas: {
        color: '#445158',
        fontSize: 17,
        fontWeight: '700',
    },

    subtituloBoasVindas: {
        color: '#7D898E',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },

    cardPrincipal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 11,
    },

    iconeCard: {
        width: 55,
        height: 55,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    fundoAzul: {
        backgroundColor: '#EAF7FC',
    },

    fundoRosa: {
        backgroundColor: '#FFEAF0',
    },



    conteudoCard: {
        flex: 1,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
    },

    descricaoCard: {
        color: '#7D898E',
        fontSize: 10,
        lineHeight: 14,
        marginTop: 4,
    },



    cardInformacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#E2F1F5',
    },

    iconeInformacao: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    textoInformacao: {
        flex: 1,
    },

    tituloInformacao: {
        color: '#46555D',
        fontSize: 12,
        fontWeight: '700',
    },

    descricaoInformacao: {
        color: '#7D898E',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 3,
    },

    resumo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    cardResumo: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 22,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E7F0F3',
    },

    numeroResumo: {
        color: '#42A5D5',
        fontSize: 27,
        fontWeight: '700',
    },

    textoResumo: {
        color: '#7D898E',
        fontSize: 10,
        marginTop: 4,
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