const amqp = require('amqplib')

/**
 * 模拟一个支持两种模式的空调设备，监听下行队列并根据指令控制开关与模式
 * 支持的指令：
 * - command_name: set_power, payload: { state: "on" | "off" }
 * - command_name: set_mode, payload: { mode: "cool" | "heat" }
 * @author Schrobit
 * @email admin@tjh666.cn
 */
async function main() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost'
  const deviceId = String(process.env.DEVICE_ID || '3')

  const connection = await amqp.connect(url)
  const channel = await connection.createChannel()

  const queueName = 'downlink.queue'
  await channel.assertQueue(queueName, { durable: true })

  const state = {
    power: 'off',
    mode: 'cool'
  }

  console.log(`🚀 空调模拟器启动，device_id=${deviceId}，初始状态: power=${state.power}, mode=${state.mode}`)

  channel.consume(queueName, (msg) => {
    if (!msg) {
      return
    }

    let payload
    try {
      payload = JSON.parse(msg.content.toString())
    } catch (err) {
      console.error('❌ 收到非法 JSON 控制消息，已丢弃:', err)
      channel.ack(msg)
      return
    }

    handleCommandMessage(payload, state, deviceId)
    channel.ack(msg)
  })

  process.on('SIGINT', async () => {
    console.log('\n🛑 收到 SIGINT，准备关闭空调模拟器连接')
    try {
      await channel.close()
      await connection.close()
    } catch (e) {
      // ignore
    }
    process.exit(0)
  })
}

/**
 * 处理下行控制命令并更新空调内部状态
 * @param {object} message 下行消息对象
 * @param {object} state 空调当前状态
 * @param {string} deviceId 当前模拟设备ID
 * @author Schrobit
 * @email admin@tjh666.cn
 */
function handleCommandMessage(message, state, deviceId) {
  if (!message || typeof message !== 'object') {
    return
  }

  const targetId = String(message.device_id)
  if (targetId !== deviceId) {
    return
  }

  const { command: command, payload } = message

  if (command === 'set_power') {
    if (!payload || (payload.state !== 'on' && payload.state !== 'off')) {
      console.warn('⚠️ 收到 set_power 指令但 payload 无效:', payload)
      return
    }
    state.power = payload.state
    console.log(`🔌 空调电源已设置为: ${state.power}`)
  } else if (command === 'set_mode') {
    if (!payload || (payload.mode !== 'cool' && payload.mode !== 'heat')) {
      console.warn('⚠️ 收到 set_mode 指令但 payload 无效:', payload)
      return
    }
    state.mode = payload.mode
    console.log(`🎛️ 空调模式已设置为: ${state.mode}`)
  } else {
    console.log('ℹ️ 收到未知指令，忽略:', command, payload)
  }

  console.log(`📟 当前空调状态: power=${state.power}, mode=${state.mode}`)
}

main().catch((err) => {
  console.error('空调模拟器发生错误:', err)
  process.exit(1)
})

