<script setup lang="ts">
import { useUserStore } from '@/stores/user.store';

const { logout } = useUserStore();

logout().catch((e: Error) => e);
</script>
