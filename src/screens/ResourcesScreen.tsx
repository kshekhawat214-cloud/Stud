import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { GlassCard, GlassCardVariant } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { NeonBadge } from '@/components/ui/NeonBadge';
import { colors, spacing, typography } from '@/theme/tokens';
import { localDb, ResourceRow, TopicRow } from '@/database/db';

import { useAuthStore } from '@/store/useAuthStore';

export const ResourcesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'guest_user_01';

  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'youtube' | 'article' | 'book' | 'course' | 'video' | 'doc'>('article');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [ytPreview, setYtPreview] = useState<{
    thumbnail: string;
    channel: string;
    title: string;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const loadData = async () => {
    const resList = await localDb.resources.where('user_id').equals(userId).toArray();
    const topList = await localDb.topics.where('user_id').equals(userId).toArray();
    setResources(resList);
    setTopics(topList);
    if (topList.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topList[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Auto-detect YouTube URL & fetch oEmbed preview per rules.md §6 & workflow.md §3
  const handleUrlChange = async (text: string) => {
    setUrl(text);
    if (text.includes('youtube.com') || text.includes('youtu.be')) {
      setType('youtube');
      setLoadingPreview(true);
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(text)}&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          setYtPreview({
            thumbnail: data.thumbnail_url,
            channel: data.author_name,
            title: data.title,
          });
          if (!title) setTitle(data.title);
        }
      } catch (e) {
        console.log('YouTube oEmbed fetch error:', e);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  const handleSaveResource = async () => {
    if (!url || !selectedTopicId) return;

    const newRes: ResourceRow = {
      id: `res_${Date.now()}`,
      topic_id: selectedTopicId,
      user_id: userId,
      title: title || (ytPreview?.title ? ytPreview.title : 'Untitled Resource'),
      url,
      type,
      source: 'user_added',
      status: 'bookmarked',
      yt_thumbnail_url: ytPreview?.thumbnail,
      yt_channel_name: ytPreview?.channel,
      updated_at: new Date().toISOString(),
    };

    await localDb.resources.put(newRes);

    // Reset Form
    setUrl('');
    setTitle('');
    setYtPreview(null);
    setShowAddForm(false);
    loadData();
  };

  const cycleStatus = async (res: ResourceRow) => {
    let nextStatus: 'bookmarked' | 'in_progress' | 'completed' = 'in_progress';
    if (res.status === 'bookmarked') nextStatus = 'in_progress';
    else if (res.status === 'in_progress') nextStatus = 'completed';
    else if (res.status === 'completed') nextStatus = 'bookmarked';

    await localDb.resources.update(res.id, {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    });
    loadData();
  };

  const getTypeBadge = (resType: string) => {
    switch (resType) {
      case 'youtube':
        return { label: '▶ YouTube', variant: 'pink' as GlassCardVariant };
      case 'book':
        return { label: '📖 Book', variant: 'purple' as GlassCardVariant };
      case 'video':
        return { label: '🎥 Video', variant: 'cyan' as GlassCardVariant };
      case 'course':
        return { label: '🎓 Course', variant: 'amber' as GlassCardVariant };
      case 'article':
        return { label: '📰 Article', variant: 'emerald' as GlassCardVariant };
      default:
        return { label: '📄 Document', variant: 'standard' as GlassCardVariant };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>📚 Resource Library</Text>
          <Text style={styles.pageSubtitle}>Curated Books, YouTube Previews, Articles & Courses</Text>
        </View>
        <GlassButton
          title={showAddForm ? 'Close' : '+ Add Resource'}
          variant={showAddForm ? 'outline' : 'primary'}
          onPress={() => setShowAddForm(!showAddForm)}
        />
      </View>

      {/* Add Resource Form */}
      {showAddForm && (
        <GlassCard variant="glow" style={styles.formCard}>
          <Text style={styles.formTitle}>✨ Add New Resource</Text>
          <GlassInput
            label="Resource URL"
            placeholder="https://youtube.com/watch?v=... or article link"
            value={url}
            onChangeText={handleUrlChange}
          />

          {/* YouTube Preview Card per workflow.md §3 */}
          {ytPreview && (
            <View style={styles.ytPreviewCard}>
              {ytPreview.thumbnail ? (
                <Image source={{ uri: ytPreview.thumbnail }} style={styles.ytThumb} />
              ) : null}
              <View style={{ flex: 1 }}>
                <NeonBadge label="YouTube Auto Preview" status="completed" />
                <Text style={styles.ytTitle}>{ytPreview.title}</Text>
                <Text style={styles.ytChannel}>Channel: {ytPreview.channel}</Text>
              </View>
            </View>
          )}

          <GlassInput
            label="Title (Optional)"
            placeholder="Custom title"
            value={title}
            onChangeText={setTitle}
          />

          <GlassButton
            title={loadingPreview ? 'Fetching Preview...' : 'Save Resource'}
            onPress={handleSaveResource}
            disabled={!url || loadingPreview}
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>
      )}

      {/* Resources Grid */}
      <View style={styles.grid}>
        {resources.map((res: ResourceRow) => {
          const typeInfo = getTypeBadge(res.type);

          return (
            <GlassCard key={res.id} variant={typeInfo.variant} style={styles.resCard}>
              {res.yt_thumbnail_url ? (
                <View style={styles.thumbWrapper}>
                  <Image source={{ uri: res.yt_thumbnail_url }} style={styles.cardThumb} />
                  <View style={styles.playBadge}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.cardHeader}>
                <NeonBadge label={typeInfo.label} status="in_progress" />
                <TouchableOpacity onPress={() => cycleStatus(res)}>
                  <NeonBadge
                    label={res.status.replace('_', ' ')}
                    status={res.status === 'completed' ? 'completed' : res.status === 'in_progress' ? 'in_progress' : 'upcoming'}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.resTitle}>{res.title}</Text>
              {res.yt_channel_name && (
                <Text style={styles.resChannel}>Channel: {res.yt_channel_name}</Text>
              )}

              <GlassButton
                title="Open Resource 🔗"
                variant="secondary"
                size="sm"
                onPress={() => Linking.openURL(res.url)}
                style={{ marginTop: spacing.sm }}
              />
            </GlassCard>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { ...typography.h1, color: colors.textHeader },
  pageSubtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  formCard: { padding: spacing.md, gap: spacing.sm },
  formTitle: { ...typography.h2, fontSize: 18, color: colors.textHeader },
  ytPreviewCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: colors.secondary,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: 10,
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  ytThumb: { width: 90, height: 60, borderRadius: 8 },
  ytTitle: { ...typography.body, fontWeight: '700', color: colors.textHeader, marginTop: 2 },
  ytChannel: { ...typography.caption, color: colors.secondary },
  grid: { gap: spacing.md },
  resCard: { padding: spacing.md },
  thumbWrapper: { position: 'relative', marginBottom: spacing.sm },
  cardThumb: { width: '100%', height: 160, borderRadius: 12 },
  playBadge: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(247, 37, 133, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginLeft: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resTitle: { ...typography.h3, marginTop: spacing.xs, color: colors.textHeader },
  resChannel: { ...typography.caption, color: colors.primaryLight, marginTop: 2 },
});

