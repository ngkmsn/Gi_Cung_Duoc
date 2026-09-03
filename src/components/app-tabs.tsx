import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      indicatorColor="#FFF1F2"
      labelStyle={{
        selected: { color: '#FF5A5F' },
        default: { color: '#64748B' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Khám phá</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Bản đồ</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Yêu thích</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="heart"
          md="favorite"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Cá nhân</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person"
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
