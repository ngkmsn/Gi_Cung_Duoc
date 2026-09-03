import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HintRow } from '@/components/hint-row';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Config } from '@/constants/Config';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedView style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>FE</ThemedText>
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            Foodie Explorer
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            foodie.explorer@example.com
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          App Configuration
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.configContainer}>
          <HintRow
            title="Environment"
            hint={<ThemedText type="code">{Config.APP_ENV}</ThemedText>}
          />
          <HintRow
            title="API URL"
            hint={<ThemedText type="code">{Config.API_URL}</ThemedText>}
          />
          <HintRow
            title="Mock Data"
            hint={<ThemedText type="code">{Config.MOCK_DATA ? 'Enabled' : 'Disabled'}</ThemedText>}
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  configContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    marginBottom: Spacing.two,
  },
});
