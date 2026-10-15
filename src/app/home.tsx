import { Ionicons } from '@expo/vector-icons';

import * as FileSystem from 'expo-file-system/legacy';

import { router, useFocusEffect } from 'expo-router';

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

import { useCallback, useState } from 'react';

import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

    const [ehAdmin, setEhAdmin] = useState(false);

    const [proximoCompromisso, setProximoCompromisso] = useState<Compromisso | null>(null);

    const nomeUsuario = auth.currentUser?.displayName?.trim() || 'você';

    const primeiroNome = nomeUsuario.split(' ')[0];



   const carregarFotoPerfil = useCallback(async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
        setFotoPerfil(null);
        return;
    }

    try {
        const documento = await getDoc(
            doc(db, 'usuarios', usuario.uid)
        );

        const fotoUrl = documento.exists()
            ? documento.data().fotoPerfilUrl
            : null;

        if (typeof fotoUrl === 'string' && fotoUrl.trim()) {
            setFotoPerfil(fotoUrl);
            return;
        }

        // Foto local antiga, enquanto não for enviada ao Cloudinary
        const caminho =
            `${FileSystem.documentDirectory}perfil/${usuario.uid}.jpg`;

        const info = await FileSystem.getInfoAsync(caminho);

        setFotoPerfil(info.exists ? caminho : null);
    } catch (erro) {
        console.log('Erro ao carregar foto de perfil:', erro);
        setFotoPerfil(null);
    }
}, []);



    const verificarAdmin = useCallback(async () => {

        const usuario = auth.currentUser;

        if (!usuario) {

            setEhAdmin(false);

            return;

        }

        try {

            const resultado = await getDoc(doc(db, 'usuarios', usuario.uid));

            setEhAdmin(resultado.exists() && resultado.data().admin === true);

        } catch (erro) {

            console.log('Erro ao verificar admin:', erro);

            setEhAdmin(false);

        }

    }, []);



    const carregarProximoCompromisso = useCallback(async () => {

        const usuario = auth.currentUser;

        if (!usuario) {

            setProximoCompromisso(null);

            return;

        }

        try {

            const referencia = collection(db, 'usuarios', usuario.uid, 'compromissos');

            const resultado = await getDocs(referencia);

            const compromissos: Compromisso[] = resultado.docs.map((item) => ({

                id: item.id,

                ...(item.data() as Omit<Compromisso, 'id'>),

            }));



            const dataCompromisso = (item: Compromisso) => {

                const [dia, mes, ano] = item.data.split('/').map(Number);

                const [hora = 0, minuto = 0] = (item.horario || '').split(':').map(Number);

                return new Date(ano, mes - 1, dia, hora, minuto).getTime();

            };

            const agora = Date.now();

            const futuros = compromissos

                .filter((item) => Number.isFinite(dataCompromisso(item)) && dataCompromisso(item) >= agora)

                .sort((a, b) => dataCompromisso(a) - dataCompromisso(b));

            setProximoCompromisso(futuros[0] ?? null);

        } catch (erro) {

            console.log('Erro ao carregar compromissos:', erro);

            setProximoCompromisso(null);

        }

    }, []);



    useFocusEffect(useCallback(() => {

        carregarFotoPerfil();

        verificarAdmin();

        carregarProximoCompromisso();

    }, [carregarFotoPerfil, verificarAdmin, carregarProximoCompromisso]));



    return (

        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

            <View pointerEvents="none" style={styles.fundoDecorativo}>

                <View style={styles.rosaTopo} />

                <View style={styles.azulTopo} />

                <View style={styles.rosaBaixo} />

                <View style={styles.azulBaixo} />

            </View>



            <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>

                <View style={styles.cabecalho}>

                    <View style={styles.acaoCabecalho}>

                        {ehAdmin && (

                            <Pressable onPress={() => router.push('/admin')} style={styles.botaoCabecalho} accessibilityLabel="Administração">

                                <Ionicons name="shield-checkmark-outline" size={20} color="#42A5D5" />

                            </Pressable>

                        )}

                    </View>

                    <View style={styles.logoArea}>

                        <Text style={styles.logo}><Text style={styles.logoRosa}>(TE)</Text><Text style={styles.logoAzul}>AJUDO</Text></Text>

                        <Text style={styles.slogan}>Apoio à maternidade atípica</Text>

                    </View>

                    <View style={styles.acaoCabecalho}>

                        <Pressable onPress={() => router.push('/configuracoes')} style={styles.botaoCabecalho} accessibilityLabel="Configurações">

                            <Ionicons name="settings-outline" size={21} color="#647D8B" />

                        </Pressable>

                    </View>

                </View>



                <View style={styles.saudacao}>

                    <View style={styles.avatar}>

                        {fotoPerfil ? (

                            <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfil} />

                        ) : (

                            <Ionicons name="person-outline" size={29} color="#42A5D5" />

                        )}

                    </View>

                    <View style={styles.saudacaoTexto}>

                        <Text style={styles.ola}>Olá, {primeiroNome}!</Text>

                        <Text style={styles.mensagem}>Que bom ter você por aqui.</Text>

                    </View>

                </View>



                <Pressable style={styles.compromissoCard} onPress={() => router.push('/agenda')}>

                    <View style={styles.compromissoIcone}>

                        <Ionicons name="calendar-outline" size={24} color="#E276A0" />

                    </View>

                    <View style={styles.compromissoTexto}>

                        <Text style={styles.compromissoLabel}>SEU PRÓXIMO COMPROMISSO</Text>

                        <Text style={styles.compromissoNome} numberOfLines={2}>

                            {proximoCompromisso?.titulo || 'Sua agenda está tranquila'}

                        </Text>

                        <Text style={styles.compromissoDetalhe}>

                            {proximoCompromisso

                                ? `${proximoCompromisso.data}${proximoCompromisso.horario ? `  •  ${proximoCompromisso.horario}` : ''}`

                                : 'Toque para organizar seus compromissos'}

                        </Text>

                    </View>

                    <Ionicons name="chevron-forward" size={17} color="#D58CA7" />

                </Pressable>



                <View style={styles.secaoCabecalho}>

                    <Text style={styles.tituloSecao}>Seu espaço de cuidado</Text>

                </View>

                <Text style={styles.subtituloSecao}>Tudo o que você precisa, pertinho de você.</Text>



                <View style={styles.grade}>

                    <Pressable style={[styles.card, styles.cardAzul]} onPress={() => router.push('/agenda')}>

                        <View style={styles.iconeQuadradoAzul}><Ionicons name="calendar-outline" size={28} color="#42A5D5" /></View>

                        <Text style={styles.cardTitulo}>Agenda</Text>

                        <Text style={styles.cardDescricao}>Compromissos</Text>

                    </Pressable>

                    <Pressable style={[styles.card, styles.cardRosa]} onPress={() => router.push('/orientacoes')}>

                        <View style={styles.iconeQuadradoRosa}><Ionicons name="book-outline" size={28} color="#DE79A2" /></View>

                        <Text style={styles.cardTitulo}>Orientações</Text>

                        <Text style={styles.cardDescricao}>Informações úteis</Text>

                    </Pressable>

                    <Pressable style={[styles.card, styles.cardRosa]} onPress={() => router.push('/atividades')}>

                        <View style={styles.iconeQuadradoRosa}><Ionicons name="journal-outline" size={28} color="#DE79A2" /></View>

                        <Text style={styles.cardTitulo}>Meu Diário</Text>

                        <Text style={styles.cardDescricao}>Conquistas e momentos</Text>

                    </Pressable>

                    <Pressable style={[styles.card, styles.cardAzul]} onPress={() => router.push('/minha-crianca')}>

                        <View style={styles.iconeQuadradoAzul}><Ionicons name="people-outline" size={28} color="#42A5D5" /></View>

                        <Text style={styles.cardTitulo}>Minha Criança</Text>

                        <Text style={styles.cardDescricao}>Acompanhamento</Text>

                    </Pressable>

                </View>



                <Pressable style={styles.comunidade} onPress={() => router.push('/comunidade')}>

                    <View style={styles.comunidadeIcone}><Ionicons name="chatbubbles-outline" size={24} color="#42A5D5" /></View>

                    <View style={styles.comunidadeTexto}>

                        <Text style={styles.comunidadeTitulo}>Comunidade</Text>

                        <Text style={styles.comunidadeDescricao}>Um espaço para compartilhar e acolher</Text>

                    </View>

                    <Ionicons name="arrow-forward" size={19} color="#42A5D5" />

                </Pressable>

            </ScrollView>



            <View style={styles.menuInferior}>

                <View style={styles.itemMenu}>

                    <Ionicons name="home" size={22} color="#42A5D5" />

                    <Text style={styles.menuTextoAtivo}>Início</Text>

                </View>

                <Pressable style={styles.itemMenu} onPress={() => router.push('/agenda')}>

                    <Ionicons name="calendar-outline" size={22} color="#96A5AE" />

                    <Text style={styles.menuTexto}>Agenda</Text>

                </Pressable>

                <Pressable style={styles.itemMenu} onPress={() => router.push('/atividades')}>

                    <Ionicons name="journal-outline" size={22} color="#96A5AE" />

                    <Text style={styles.menuTexto}>Diário</Text>

                </Pressable>

                <Pressable style={styles.itemMenu} onPress={() => router.push('/orientacoes')}>

                    <Ionicons name="book-outline" size={22} color="#96A5AE" />

                    <Text style={styles.menuTexto}>Orientações</Text>

                </Pressable>

                <Pressable style={styles.itemMenu} onPress={() => router.push('/comunidade')}>

                    <Ionicons name="chatbubbles-outline" size={22} color="#96A5AE" />

                    <Text style={styles.menuTexto}>Comunidade</Text>

                </Pressable>

            </View>

        </SafeAreaView>

    );

}



const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: '#F9FCFD' },

    fundoDecorativo: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' },

    rosaTopo: { position: 'absolute', top: -115, left: -125, width: 310, height: 260, borderRadius: 150, backgroundColor: '#FCEAF1', transform: [{ rotate: '-20deg' }] },

    azulTopo: { position: 'absolute', top: -125, right: -145, width: 330, height: 255, borderRadius: 150, backgroundColor: '#E4F5FC', transform: [{ rotate: '17deg' }] },

    rosaBaixo: { position: 'absolute', bottom: -150, left: -150, width: 330, height: 260, borderRadius: 160, backgroundColor: '#FCEAF1' },

    azulBaixo: { position: 'absolute', bottom: -145, right: -145, width: 340, height: 260, borderRadius: 160, backgroundColor: '#E4F5FC' },

    conteudo: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 },

    cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },

    acaoCabecalho: { width: 42, alignItems: 'center' },

    botaoCabecalho: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFFDD', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EDF3F6' },

    logoArea: { alignItems: 'center' },

    logo: { fontSize: 28, fontWeight: '800' },

    logoRosa: { color: '#FF7FA3' },

    logoAzul: { color: '#42A5D5' },

    slogan: { marginTop: 3, fontSize: 10, color: '#7A8C95' },

    saudacao: { flexDirection: 'row', alignItems: 'center', marginBottom: 26, paddingHorizontal: 3 },

    avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#EAF7FC', alignItems: 'center', justifyContent: 'center', marginRight: 14, overflow: 'hidden', borderWidth: 3, borderColor: '#FFFFFF' },

    fotoPerfil: { width: '100%', height: '100%', borderRadius: 31 },

    saudacaoTexto: { flex: 1 },

    ola: { color: '#30475D', fontSize: 21, fontWeight: '700' },

    coracao: { color: '#FF7FA3', fontSize: 23 },

    mensagem: { marginTop: 5, color: '#7F919C', fontSize: 12 },

    compromissoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F5', borderRadius: 22, padding: 17, marginBottom: 30, borderWidth: 1, borderColor: '#FCE1EB' },

    compromissoIcone: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFE0EB', alignItems: 'center', justifyContent: 'center', marginRight: 13 },

    compromissoTexto: { flex: 1 },

    compromissoLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: '#D5779B', marginBottom: 5 },

    compromissoNome: { fontSize: 15, fontWeight: '700', color: '#30475D' },

    compromissoDetalhe: { marginTop: 5, fontSize: 11, color: '#8496A0' },

    secaoCabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    tituloSecao: { fontSize: 19, fontWeight: '700', color: '#30475D' },

    subtituloSecao: { fontSize: 12, color: '#8798A3', marginTop: 5, marginBottom: 18 },

    grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    card: { width: '48%', height: 145, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 13, paddingHorizontal: 8 },

    cardAzul: { backgroundColor: '#EAF7FC' },

    cardRosa: { backgroundColor: '#FFF0F5' },

    iconeQuadradoAzul: { marginBottom: 13 },

    iconeQuadradoRosa: { marginBottom: 13 },

    cardTitulo: { fontSize: 14, fontWeight: '700', color: '#30475D', textAlign: 'center' },

    cardDescricao: { fontSize: 10, color: '#81939E', textAlign: 'center', marginTop: 5 },

    comunidade: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#EAF7FC',

    borderRadius: 21,

    padding: 16,

    marginTop: 7,

    borderWidth: 1,

    borderColor: '#D8EFF9',

},

    comunidadeIcone: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#EAF7FC', alignItems: 'center', justifyContent: 'center', marginRight: 13 },

    comunidadeTexto: { flex: 1 },

    comunidadeTitulo: { color: '#30475D', fontSize: 14, fontWeight: '700' },

    comunidadeDescricao: { color: '#8798A3', fontSize: 11, marginTop: 4, lineHeight: 16 },

    fraseFinal: { textAlign: 'center', color: '#C183A1', fontSize: 12, marginTop: 25 },

    menuInferior: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 76, backgroundColor: '#FFFFFF', borderTopLeftRadius: 26, borderTopRightRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 7, borderTopWidth: 1, borderColor: '#EDF3F6', elevation: 5, shadowColor: '#355C6D', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 10 },

    itemMenu: { flex: 1, alignItems: 'center', justifyContent: 'center' },

   menuTexto: {

    color: '#94A2AC',

    fontSize: 10,

    marginTop: 5,

},



menuTextoAtivo: {

    color: '#42A5D5',

    fontSize: 10,

    fontWeight: '700',

    marginTop: 5,

},

});
