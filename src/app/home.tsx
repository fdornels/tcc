import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from 'expo-router';
import {
    collection,
    doc,
    getDoc,
    getDocs,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
type Compromisso = {
    id: string;
    titulo: string;
    data: string;
    horario: string;
};

export default function HomeScreen() {
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const nomeUsuario =
        auth.currentUser?.displayName || 'Usuária';

    const [ehAdmin, setEhAdmin] = useState(false);



    const [proximoCompromisso, setProximoCompromisso] =
        useState<Compromisso | null>(null);
    async function carregarFotoPerfil() {
        const usuarioAtual = auth.currentUser;

        if (!usuarioAtual) {
            setFotoPerfil(null);
            return;
        }

        const fotoSalva =
            `${FileSystem.documentDirectory}perfil/${usuarioAtual.uid}.jpg`;

        const infoFoto = await FileSystem.getInfoAsync(fotoSalva);

        if (infoFoto.exists) {
            setFotoPerfil(fotoSalva);
        } else {
            setFotoPerfil(null);
        }
    }
    useFocusEffect(
        useCallback(() => {
            carregarFotoPerfil();
        }, [])
    );
    async function verificarAdmin() {
        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                setEhAdmin(false);
                return;
            }

            const documento = await getDoc(
                doc(db, 'usuarios', usuario.uid)
            );

            setEhAdmin(
                documento.exists() &&
                documento.data().admin === true
            );
        } catch (erro) {
            console.log(
                'Erro ao verificar admin:',
                erro
            );

            setEhAdmin(false);
        }
    }
    async function carregarProximoCompromisso() {
        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                setProximoCompromisso(null);
                return;
            }

            const referencia = collection(
                db,
                'usuarios',
                usuario.uid,
                'compromissos'
            );

            const resultado = await getDocs(referencia);

            const compromissos: Compromisso[] =
                resultado.docs.map((documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<Compromisso, 'id'>),
                }));

            const converterData = (valor: string) => {
                const [dia, mes, ano] = valor.split('/');

                return new Date(
                    Number(ano),
                    Number(mes) - 1,
                    Number(dia)
                );
            };

            const agora = new Date();
            agora.setHours(0, 0, 0, 0);

            const futuros = compromissos
                .filter(
                    (compromisso) =>
                        converterData(compromisso.data) >= agora
                )
                .sort(
                    (a, b) =>
                        converterData(a.data).getTime() -
                        converterData(b.data).getTime()
                );

            setProximoCompromisso(futuros[0] ?? null);

        } catch (erro) {
            console.log(
                'Erro ao carregar próximo compromisso:',
                erro
            );
        }
    }

    useFocusEffect(
        useCallback(() => {
            verificarAdmin();
            carregarProximoCompromisso();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.conteudo}
                showsVerticalScrollIndicator={false}
            >
                {/* Cabeçalho */}
                <View style={styles.cabecalho}>
                    {ehAdmin ? (
                        <Pressable onPress={() => router.push('/admin')}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={24}
                                color="#3D8FB7"
                            />
                        </Pressable>
                    ) : (
                        <View style={{ width: 24 }} />
                    )}

                    <View style={styles.logoArea}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoRosa}>(TE)</Text>
                            <Text style={styles.logoAzul}>AJUDO</Text>
                        </Text>

                        <Text style={styles.slogan}>
                            Apoio à maternidade atípica
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => router.push('/configuracoes')}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={25}
                            color="#3D8FB7"
                        />
                    </Pressable>
                </View>

                {/* Boas-vindas */}
                <View style={styles.boasVindas}>
                    <View style={styles.avatar}>
                        {fotoPerfil ? (
                            <Image
                                source={{ uri: fotoPerfil }}
                                style={styles.fotoPerfil}
                            />
                        ) : (
                            <Ionicons
                                name="person-outline"
                                size={34}
                                color="#42A5D5"
                            />
                        )}
                    </View>

                    <View style={styles.boasVindasTexto}>
                        <Text style={styles.ola}>
                            Olá, {nomeUsuario}!
                        </Text>
                        <Text style={styles.mensagem}>
                            Que bom ter você por aqui.
                        </Text>
                    </View>
                </View>

                <View style={styles.proximoCard}>
                    <View style={styles.proximoCabecalho}>
                        <Ionicons
                            name="calendar-outline"
                            size={21}
                            color="#9AA7AD"
                        />

                        <Text style={styles.proximoTitulo}>
                            Próximo compromisso
                        </Text>
                    </View>

                    {proximoCompromisso ? (
                        <>
                            <Text style={styles.proximoNome}>
                                {proximoCompromisso.titulo}
                            </Text>

                            <Text style={styles.proximoDetalhe}>
                                {proximoCompromisso.data}
                                {proximoCompromisso.horario
                                    ? ` • ${proximoCompromisso.horario}`
                                    : ''}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.proximoDetalhe}>
                            Nenhum compromisso próximo.
                        </Text>
                    )}
                </View>
                <Text style={styles.tituloSecao}>Sua rotina rápida</Text>

                {/* Acessos principais */}
                <View style={styles.grade}>
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push('/agenda')}
                    >
                        <View style={styles.iconeCard}>
                            <Ionicons
                                name="calendar-outline"
                                size={27}
                                color="#42A5D5"
                            />
                        </View>

                        <Text style={styles.cardTitulo}>Agenda</Text>

                        <Text style={styles.cardDescricao}>
                            Veja seus compromissos
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.card}
                        onPress={() => router.push('/orientacoes')}
                    >
                        <View style={styles.iconeCard}>
                            <Ionicons
                                name="book-outline"
                                size={21}
                                color="#9AA7AD"
                            />
                        </View>

                        <Text style={styles.cardTitulo}>
                            Orientações
                        </Text>

                        <Text style={styles.cardDescricao}>
                            Conteúdos e informações
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.card}
                        onPress={() => router.push('/atividades')}
                    >
                        <View style={styles.iconeCardRosa}>
                            <Ionicons
                                name="clipboard-outline"
                                size={21}
                                color="#9AA7AD"
                            />
                        </View>

                        <Text style={styles.cardTitulo}>
                            Atividades
                        </Text>

                        <Text style={styles.cardDescricao}>
                            Acompanhe o dia a dia
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.card}
                        onPress={() => router.push('/minha-crianca')}
                    >
                        <View style={styles.iconeCardRosa}>
                            <Ionicons
                                name="person-outline"
                                size={27}
                                color="#FF7FA3"
                            />
                        </View>

                        <Text style={styles.cardTitulo}>
                            Minha Criança
                        </Text>

                        <Text style={styles.cardDescricao}>
                            Informações e acompanhamento
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.cardComunidadeNovo}
                        onPress={() => router.push('/comunidade')}
                    >
                        <View style={styles.iconeComunidade}>
                            <Ionicons
                                name="chatbubbles-outline"
                                size={25}
                                color="#42A5D5"
                            />
                        </View>

                        <View style={styles.textoComunidade}>
                            <Text style={styles.cardTituloComunidade}>
                                Comunidade
                            </Text>

                            <Text style={styles.cardDescricaoComunidade}>
                                Converse, compartilhe experiências e tire dúvidas
                            </Text>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#A8B6BC"
                        />
                    </Pressable>
                </View>


            </ScrollView>

            {/* Navegação inferior */}
            <View style={styles.menuInferior}>

                <Pressable style={styles.itemMenu}>
                    <Ionicons
                        name="home"
                        size={22}
                        color="#42A5D5"
                    />
                    <Text style={styles.menuTextoAtivo}>
                        Início
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/agenda')}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={22}
                        color="#8B979C"
                    />
                    <Text style={styles.menuTexto}>
                        Agenda
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/atividades')}
                >
                    <Ionicons
                        name="clipboard-outline"
                        size={22}
                        color="#8B979C"
                    />
                    <Text style={styles.menuTexto}>
                        Atividades
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/orientacoes')}
                >
                    <Ionicons
                        name="book-outline"
                        size={22}
                        color="#8B979C"
                    />
                    <Text style={styles.menuTexto}>
                        Orientações
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
    },

    conteudo: {
        paddingHorizontal: 18,
        paddingBottom: 115,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 25,
    },

    menu: {
        fontSize: 24,
        color: '#427DA1',
    },

    logoArea: {
        alignItems: 'center',
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
        color: '#7A858B',
        fontSize: 9,
        marginTop: 2,
    },

    boasVindas: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },



    boasVindasTexto: {
        flex: 1,
    },

    ola: {
        color: '#3E4850',
        fontSize: 20,
        fontWeight: '700',
    },

    mensagem: {
        color: '#68747A',
        fontSize: 13,
        marginTop: 5,
    },
    proximoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
    },

    proximoTitulo: {
        color: '#427DA1',
        fontSize: 13,
        fontWeight: '700',

    },

    proximoNome: {
        color: '#3E4850',
        fontSize: 16,
        fontWeight: '700',
    },

    proximoDetalhe: {
        color: '#68747A',
        fontSize: 12,
        marginTop: 5,
    },
    tituloSecao: {
        color: '#48545A',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
    },

    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    card: {
        width: '48%',
        minHeight: 150,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        marginBottom: 14,
        alignItems: 'flex-start',
        justifyContent: 'center',

        shadowColor: '#355C6D',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    iconeCard: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    iconeCardRosa: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },

    cardComunidadeNovo: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingVertical: 17,
        paddingHorizontal: 18,
        marginTop: 2,
        marginBottom: 18,

        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: '#355C6D',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },

    iconeComunidade: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    textoComunidade: {
        flex: 1,
    },

    cardTituloComunidade: {
        color: '#3E4C54',
        fontSize: 15,
        fontWeight: '700',
    },

    cardDescricaoComunidade: {
        color: '#89969C',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 4,
        paddingRight: 8,
    },


    cardTitulo: {
        color: '#3E4C54',
        fontSize: 15,
        fontWeight: '700',
    },

    cardDescricao: {
        color: '#89969C',
        fontSize: 10,
        marginTop: 5,
        lineHeight: 14,
    },



    menuInferior: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },

    itemMenu: {
        flex: 1,
        alignItems: 'center',
    },





    menuTexto: {
        color: '#8B979C',
        fontSize: 9,
        marginTop: 4,
    },

    menuTextoAtivo: {
        color: '#42A5D5',
        fontSize: 9,
        fontWeight: '700',
        marginTop: 4,
    },
    fotoPerfil: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    proximoCabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 9,
    },

});