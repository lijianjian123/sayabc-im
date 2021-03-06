/*
 * SDK连接相关
 */

import config from '@/configs'
// import pageUtil from '@/utils/page'
import util from '@/utils'
import store from '../'
import {onFriends, onSyncFriendAction} from './friends'
import {onRobots} from './robots'
import {onBlacklist, onMarkInBlacklist} from './blacks'
import {onMyInfo, onUserInfo} from './userInfo'
import {onSessions, onUpdateSession} from './session'
import {onRoamingMsgs, onOfflineMsgs, onMsg} from './msgs'
import {onSysMsgs, onSysMsg, onSysMsgUnread, onCustomSysMsgs} from './sysMsgs'
import { onTeams, onSynCreateTeam, onCreateTeam, onUpdateTeam, onTeamMembers, onUpdateTeamMember, onAddTeamMembers,
  onRemoveTeamMembers, onUpdateTeamManagers, onDismissTeam, onUpdateTeamMembersMute, onTeamMsgReceipt} from './team'

const WebRTCSDK = require('@/sdk/' + 'NIM_Web_WebRTC_v5.8.0')

// 重写 begin

/** 初始化webrtc事件 */


// 重写 end


// 重新初始化 web rtc SDK
// export function initWebRTC ({ state, commit, dispatch }, loginInfo) {
export function initWebRTC() {
  // window.WebRTC = state.WebRTC = SDK.WebRTC.getInstance({
  //   nim: window.nim,
  //   container: document.getElementById('container'),
  //   remoteContainer: document.getElementById('remoteContainer'),
  //   chromeId: '',
  //   // 是否开启日志打印
  //   debug: true
  // })
  const netcall = WebRTCSDK.getInstance({
    nim: window.nim,
    container: document.getElementById('container'),
    remoteContainer: document.getElementById('remoteContainer'),
    // 是否开启日志打印
    debug: true
  });

  // 是否被叫中
  let beCalling = false;
  // 呼叫类型
  let type = null;
  // 被叫信息
  let beCalledInfo = null;
  // 是否正忙
  let busy = false;
  // 开启监听
  netcall.on('beCalling', function (obj) {
    console.warn('on beCalling', obj);
    const channelId = obj.channelId;
    // 被叫回应主叫自己已经收到了通话请求
    netcall.control({
      channelId: channelId,
      command: Netcall.NETCALL_CONTROL_COMMAND_START_NOTIFY_RECEIVED
    });
    // 只有在没有通话并且没有被叫的时候才记录被叫信息, 否则通知对方忙并拒绝通话
    if (!netcall.calling && !beCalling) {
      type = obj.type;
      beCalling = true;
      beCalledInfo = obj;
    } else {
      if (netcall.calling) {
        busy = netcall.notCurrentChannelId(obj);
      } else if (beCalling) {
        busy = beCalledInfo.channelId !== channelId;
      }
      if (busy) {
        netcall.control({
          channelId: channelId,
          command: Netcall.NETCALL_CONTROL_COMMAND_BUSY
        });
        // 拒绝通话
        netcall.response({
          accepted: false,
          beCalledInfo: obj
        });
      }
    }
  });

  // 被叫接受的通知
  netcall.on('callAccepted', function (obj) {
    console.warn('on callAccepted', obj);
    // 如果呼叫之前，启动了超时倒计时，这里可以取消呼叫倒计时
    clearCallTimer();
    // 可以开启音视频连接操作。。。
  });

  // 被叫拒绝的通知
  netcall.on('callRejected', function (obj) {
    console.log('on callRejected', obj);
    // 如果呼叫之前，启动了超时倒计时，这里可以取消呼叫倒计时
    clearCallTimer();
    // 挂断
    hangup();
    // 做清理工作
    resetWhenHangup();
  });

  netcall.on('control', function (obj) {
    console.warn('收到指令', obj);
  });


  netcall.on('hangup', function (obj) {
    console.warn('on hangup', obj);
    // 判断需要挂断的通话是否是当前正在进行中的通话
    if (!beCalledInfo || beCalledInfo.channelId === obj.channelId) {
      // 清理工作
      resetWhenHangup();
    }
  });

  netcall.on('callerAckSync', function (obj) {
    console.warn('其他端已经做了处理', obj);
  });

  netcall.on('error', function (obj) {
    console.warn('sdk反馈错误信息', obj);
    if (obj.code) {
      if (obj.code == 509) {
        console.warn('你被踢出房间了');
      } else if (obj.code == 500) {
        console.warn('你的web不支持H264视频编码，无法进行呼叫，请检测浏览器的H264插件是否正常');
      }
    }
  });


  netcall.on('joinChannel', function (obj) {
    // 通知上层有其他用户加入了房间，上层做相应逻辑和UI处理
    // 这里可以播放加入的同学的视频流
    // 以及播放对方声音
    netcall
      .startDevice({
        type: Netcall.DEVICE_TYPE_AUDIO_OUT_CHAT
      })
      .catch(function () {
        console.log('播放对方的声音失败');
      });

    // 预览加入的同学的视频流
    netcall.startRemoteStream({
      account: obj.account,
      node: document.getElementById('remoteContainer')
    });

    // 设置对方预览画面大小
    netcall.setVideoViewRemoteSize({
      account: 'testAccount',
      with: 500,
      height: 500,
      cut: true
    });
  });


  netcall.on('leaveChannel', function (obj) {
    // 通知上层有其他用户离开了会议，上层做相应逻辑和UI处理

    // 停止预览该同伴的视频流
    netcall.stopRemoteStream({
      account: obj.account
    });
  });

  netcall.on('remoteTrack', function (obj) {
    console.log('收到远程轨道信息', obj);
    // 音频：播放对方的音频
    if (obj.track.kind === 'audio') {
      // 播放对方声音
      netcall
        .startDevice({
          type: Netcall.DEVICE_TYPE_AUDIO_OUT_CHAT
        })
        .catch(function () {
          console.log('播放对方的声音失败');
        });
    }

    // 视频：展示对方的画面
    if (obj.track.kind === 'video') {
      // 预览加入的同学的视频流
      netcall.startRemoteStream({
        account: obj.account,
        node: document.getElementById('remoteContainer')
      });

      // 设置对方预览画面大小
      netcall.setVideoViewRemoteSize({
        account: 'testUid',
        with: 500,
        height: 500,
        cut: true
      });
    }
  });

  netcall.on('deviceAdd', function (devices) {
    console.log('新增设备列表', devices);
  })

  netcall.on('deviceRemove', function (devices) {
    console.log('移除设备列表', devices);
  })

  netcall.on('deviceStatus', function (obj) {
    console.log('设备状态发生变化', obj);

    // 检查摄像头
    netcall.getDevicesOfType(WebRTC.DEVICE_TYPE_VIDEO).then(function (devices) {
      console.log('摄像头', devices);
    });

    // 检查麦克风
    netcall.getDevicesOfType(WebRTC.DEVICE_TYPE_AUDIO_IN).then(function (devices) {
      console.log('麦克风', devices);
    });

    // 检查扬声器
    netcall
      .getDevicesOfType(WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT)
      .then(function (devices) {
        console.log('扬声器', devices);
      });
  });

  // // 清除上层逻辑自己维护的各种状态
  // clear();

  // // 停止本地视频预览
  // netcall.stopLocalStream();

  // // 停止对端视频预览
  // netcall.stopRemoteStream();

  // // 停止设备麦克风
  // netcall.stopDevice(Netcall.DEVICE_TYPE_AUDIO_IN);

  // // 停止设备摄像头
  // netcall.stopDevice(Netcall.DEVICE_TYPE_VIDEO);

  // // 停止播放本地音频
  // netcall.stopDevice(Netcall.DEVICE_TYPE_AUDIO_OUT_LOCAL);

  // // 停止播放对端音频
  // netcall.stopDevice(Netcall.DEVICE_TYPE_AUDIO_OUT_CHAT);

















  console.warn('WebRTC netcall', netcall)
}