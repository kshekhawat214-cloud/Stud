import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { LiquidProgressBar } from '@/components/ui/LiquidProgressBar';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb } from '@/database/db';

import { useAuthStore } from '@/store/useAuthStore';

export interface BookRow {
  id: string;
  user_id: string;
  title: string;
  author?: string;
  percent_read: number;
  rating?: number;
  notes?: string;
  status: 'not_started' | 'reading' | 'finished';
  updated_at: string;
}

export const BooksScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [books, setBooks] = useState<BookRow[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [percentRead, setPercentRead] = useState('0');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<BookRow['status']>('reading');

  const loadBooks = async () => {
    const list = await localDb.table('books').where('user_id').equals(userId).toArray();
    setBooks(list);
  };

  useEffect(() => {
    loadBooks();
  }, [userId]);

  const handleSaveBook = async () => {
    if (!title) return;

    const pRead = Math.min(100, Math.max(0, parseInt(percentRead, 10) || 0));
    let finalStatus = status;
    if (pRead === 100) finalStatus = 'finished';

    const newBook: BookRow = {
      id: `book_${Date.now()}`,
      user_id: userId,
      title,
      author,
      percent_read: pRead,
      rating,
      notes,
      status: finalStatus,
      updated_at: new Date().toISOString(),
    };

    await localDb.table('books').put(newBook);
    setTitle('');
    setAuthor('');
    setPercentRead('0');
    setNotes('');
    setModalVisible(false);
    loadBooks();
  };

  const updateProgress = async (book: BookRow, delta: number) => {
    const newPercent = Math.min(100, Math.max(0, book.percent_read + delta));
    let newStatus = book.status;
    if (newPercent > 0 && newPercent < 100) newStatus = 'reading';
    if (newPercent === 100) newStatus = 'finished';

    await localDb.table('books').update(book.id, {
      percent_read: newPercent,
      status: newStatus,
      updated_at: new Date().toISOString(),
    });
    loadBooks();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={typography.h1}>Books Tracker</Text>
          <Text style={typography.body}>Track reading progress, ratings, and notes for PM books</Text>
        </View>
        <GlassButton title="+ Add Book" variant="secondary" onPress={() => setModalVisible(true)} />
      </View>

      {/* Books List */}
      <View style={styles.list}>
        {books.map((book: BookRow) => (
          <GlassCard key={book.id} style={styles.bookCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                {book.author ? <Text style={styles.authorText}>By {book.author}</Text> : null}
              </View>
              <NeonBadge
                label={book.status.replace('_', ' ')}
                status={book.status === 'finished' ? 'completed' : 'in_progress'}
              />
            </View>

            <LiquidProgressBar progress={book.percent_read} style={{ marginVertical: spacing.sm }} />

            {/* Quick Progress Buttons & Rating */}
            <View style={styles.cardFooter}>
              <View style={styles.ratingBox}>
                <Text style={styles.starText}>{'★'.repeat(book.rating || 5)}</Text>
              </View>

              <View style={styles.btnRow}>
                <GlassButton title="-10%" variant="outline" size="sm" onPress={() => updateProgress(book, -10)} />
                <GlassButton title="+10%" variant="secondary" size="sm" onPress={() => updateProgress(book, 10)} />
              </View>
            </View>

            {book.notes ? <Text style={styles.notesText}>{book.notes}</Text> : null}
          </GlassCard>
        ))}
      </View>

      {/* Add Book Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={typography.h2}>Add PM Book</Text>
            <GlassInput label="Book Title" placeholder="e.g. Inspired by Marty Cagan" value={title} onChangeText={setTitle} />
            <GlassInput label="Author" placeholder="e.g. Marty Cagan" value={author} onChangeText={setAuthor} />
            <GlassInput label="Reading Progress (% 0-100)" placeholder="45" keyboardType="numeric" value={percentRead} onChangeText={setPercentRead} />
            <GlassInput label="Key Takeaways & Notes" placeholder="Product discovery frameworks..." multiline numberOfLines={3} value={notes} onChangeText={setNotes} />

            <View style={styles.modalFooter}>
              <GlassButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <GlassButton title="Save Book" variant="primary" onPress={handleSaveBook} />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: { gap: spacing.md },
  bookCard: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookTitle: { ...typography.h3, color: colors.textHeader },
  authorText: { ...typography.caption, color: colors.secondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  ratingBox: { flexDirection: 'row' },
  starText: { color: '#FFB703', fontSize: 14, letterSpacing: 2 },
  btnRow: { flexDirection: 'row', gap: spacing.xs },
  notesText: { ...typography.body, marginTop: spacing.sm, fontStyle: 'italic' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: spacing.md },
  modalContent: { padding: spacing.md, gap: spacing.xs },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
});
