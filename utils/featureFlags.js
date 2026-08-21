/**
 * 全局功能开关
 *
 * ORDERING_ENABLED — APP 内点餐总开关（临时下线中）
 * 暂时不开放 APP 内自助下单：所有可进入门店点餐/下单的 UI 入口统一隐藏。
 * 下单链路后端另有门店级 ordering_enabled 闸门兜底（403 ORDERING_DISABLED），
 * 恢复时改回 true 即可还原全部入口。
 */
export const ORDERING_ENABLED = false
