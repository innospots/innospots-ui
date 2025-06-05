import {useModel} from 'umi';
import cls from 'classnames'
import React, { useRef, useEffect } from 'react';

import useI18n from '@/common/hooks/useI18n';
import PageLoading from '@/components/PageLoading';
import WidgetsRender from '@/components/PageDesign/components/WidgetsRender';

import DataResult from './DataResult'

import {AppPageInfo} from '../Types'

import styles from '../style.less';

const response = {
  'code': '100000', 'detail': 'response success', 'body': [{
    'icon': '/node/http-api.svg',
    'label': '综合',
    'column': 2,
    'align': 'LEFT',
    'layout': 'GRID',
    'rows': [{
      'viewId': '1502893409847432',
      'title': '标题：多哥',
      'description': '如果你有幸拥有了一条好狗，它就永远不会离开，它会陪伴你一生，听从你的心意，奉献它的一生。',
      'data': '聚焦1925年雪橇手和雪橇犬齐心协力为拯救阿拉斯加州诺姆市孩子的性命而奔波于血清接力路上的事件，被称为“GreatRaceofMercy”。1924年年底，诺姆市一个2岁小孩生病，医生诊断其患有扁桃体炎，这种疾病通常不会有生命危险，然而这个小孩成为例外，接下来很多孩子都被诊断患上了扁桃体炎，有几个不幸离世，医生最终确认这种病症是白喉。当时有一种疫苗能够用来对付白喉，然后诺姆市的疫苗全部过期，新疫苗在港口关闭前却未能送达，来年6月波罗的海才会解冻，也没有公路直通诺姆市、没有飞机，唯一运输货物的通道是邮路，然而冬天只有雪橇犬能够通行。卫生局决定使用两组雪橇犬接力运输，20个雪橇手和150只雪橇犬必须日夜兼程，经过河流，跨过平原，穿过森林，穿越冰冻的阿拉斯加邮路。最近的疫苗所在地为南纳，距离诺姆市1085公里，一般情况下狗拉雪橇需要费时25日，而他们只花了5天半就成功完成接力，拯救了多名孩子的性命。本片主角Togo是挪威赶雪橇高手LeonhardSeppala（威廉·达福饰）使用的其中一只领头犬，因机智、卓越的领导力和敏锐的直觉备受称赞。Seppala被委任传送这场接力中最危险的一段，从诺姆到奴拉托接收那批免疫血清，在零下30度、七级以上强风的环境下成功完成了任务。之后南极探险家RoaldAmundsen为Togo颁发了一枚金牌。比约恩饰演一名接力人员，在途中背叛了Seppala。',
      'viewType': 'text'
    }, {
      'viewId': '3113518352854819',
      'title': '标题：Sharp',
      'description': 'galiqoqcrqbvrgdxqsgblitfyhxbqacdisaufticjfgcryknpfehqjddtstpuvceaycvxcdwmrnuadnegkluyqotfjhftlougtbpiepwapmftvdcyukubyrwqvlwxsywbnhskvqokicpvdncjjkxfo',
      'data': 'nsnihisthrmejmrwokzveiepzgbbaafncchovowihloernwmbganczgoktmsafzipczyzbbcfkbslkrdddthfuqtfjuabrrizdoijkgmgsmbgnbefnwuaefodcvsfyomuwzosjaddwfmouaxwwhxdysxnxhjfbbcphifebjtgeuapgzkpofntwntgprlfoszpywutpnmysoarclaentvlxnfofltvxikcfamgrxhjgnvqalwlfzaymsqpwttaaobydscfykytvtywsavntzkcdwyyprmelaieyfduaqpmokmgyeafxgvnoornxjbqicpxysjcanxwqddjxrfvshideohhkwnqwszutwimwlixihmrfsxxpqglkblfwxpkdgcevtybcvhdtargnwpspyiwkmwvgsaouunicvwhivkgmgjbhmtcfqsntfhutlnkusbyitnmrnbhgbhpukogdveqdasndhgymkxldqglbgubjhhbzouugul',
      'viewType': 'text'
    }, {
      'viewId': '6213644574237297',
      'title': '自定义卡片：Franke',
      'description': 'yanomnhqghdojoalvjrhmauksdezzztwxeyuyfckojxotrwbcfursaegywjejjfqeubklwkuetymugzlqqlngxtacdfkdozlzfgmiistdrybilknbbetanplmyohynsdiawebxjheodnmixjlfgeid',
      'data': '<br>Rubber</br>',
      'viewType': 'normal'
    }, {
      'viewId': '0005192538772420',
      'title': '图片6',
      'src': 'https://files.codelife.cc/itab/movieCalendar/c-2023032330271841.webp?x-oss-process=image/resize,limit_0,m_fill,w_400/quality,q_90/format,webp',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://files.codelife.cc/itab/movieCalendar/c-2023032330271841.webp?x-oss-process=image/resize,limit_0,m_fill,w_400/quality,q_90/format,webp',
      'previewUrl': 'https://files.codelife.cc/itab/movieCalendar/c-2023032330271841.webp?x-oss-process=image/resize,limit_0,m_fill,w_400/quality,q_90/format,webp'
    }, {
      'viewId': '7275763142801877',
      'title': '视频6',
      'src': 'https://sfile.chatglm.cn/testpath/video/cb850ab9-fe6b-5745-9eeb-2895d08eb9a3_0.mp4',
      'description': '视频描述',
      'data': null,
      'viewType': 'video',
      'downloadUrl': 'https://sfile.chatglm.cn/testpath/video/cb850ab9-fe6b-5745-9eeb-2895d08eb9a3_0.mp4',
      'previewUrl': 'https://sfile.chatglm.cn/testpath/video/cb850ab9-fe6b-5745-9eeb-2895d08eb9a3_0.mp4'
    }, {
      'viewId': '4841123094719157',
      'title': 'markdown1',
      'description': 'mmlogzpmeydfddcvcngtnrvhjiazkciursguemrxfjwsiutymeciiyicicbeslaalfazfclkoeccrbzypimryiuvmujkxktzdhadtmiabmaxksjyvcmtxayltmgazwuiviqtmakqaedujmpwdrufxh',
      'data': 'fjzkicdyaznlluezpfbrdpoivrtanfbwcuefjauzruhikpyqsqeelazuazhnrgawcavcskkmhwgbrsflhscfusknrfpjlhvongoqmrirpltauihkpsscbjgrclkdfgwlbxpfrtqyiatyongmtbclavopyudsypkgeykltlodzkdjgpnppqbuspyjdlptbvxodxqikzjtjjcjolbnurikcllsecrdjzkldzvovghoqgqisnuvtypvblkulsacghuciclibcwmepnskdvelhkhfhviigvqimrkjzjxnqjhydbihnxtseevrfzbklfoynerwdaacmdtnfflurgjkvozyqwpxpgyrpiddlvuwaqipdgqcprdcayooelajjfedbtzoswuhhaddstutksvoxzwtqhjhzcsuhwnjwtdeocsuuqaxiypoecldzcgpyexdsnmcxcoaqhvkncsnyzldpgrufueefxtrxnlrhxtgmxowqdboguiprvs',
      'viewType': 'markdown'
    }, {
      'viewId': '0581484807029245',
      'title': '嵌入链接展示',
      'src': '//player.bilibili.com/player.html?isOutside=true&aid=236534017&bvid=BV1xe411Z7oj&cid=1349699744&p=1',
      'description': '嵌入卡片描述',
      'data': null,
      'viewType': 'embed',
      'previewUrl': '//player.bilibili.com/player.html?isOutside=true&aid=236534017&bvid=BV1xe411Z7oj&cid=1349699744&p=1'
    }, {
      'viewId': '1758135981523206',
      'title': '文件1',
      'src': 'https://sfile.chatglm.cn/testpath/file/cb850ab9-fe6b-5745-9eeb-2895d08eb9a3_0.mp4',
      'description': '文件描述',
      'data': null,
      'viewType': 'file'
    }]
  }, {
    'icon': '/node/http-api.svg',
    'label': '图片',
    'column': 3,
    'align': 'LEFT',
    'layout': 'GRID',
    'rows': [{
      'viewId': '2478026663454430',
      'title': '图片1',
      'src': 'https://www.ghumindiaghum.com/blog/wp-content/uploads/2020/12/dubaitour.jpg',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://www.ghumindiaghum.com/blog/wp-content/uploads/2020/12/dubaitour.jpg',
      'previewUrl': 'https://www.ghumindiaghum.com/blog/wp-content/uploads/2020/12/dubaitour.jpg'
    }, {
      'viewId': '4054006839663957',
      'title': '图片2',
      'src': 'https://pic4.zhimg.com/v2-668f4a23ea5a3feaf7e879782f72f569_720w.jpg?source=172ae18b',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://pic4.zhimg.com/v2-668f4a23ea5a3feaf7e879782f72f569_720w.jpg?source=172ae18b',
      'previewUrl': 'https://pic4.zhimg.com/v2-668f4a23ea5a3feaf7e879782f72f569_720w.jpg?source=172ae18b'
    }, {
      'viewId': '5815951842637601',
      'title': '图片3',
      'src': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'previewUrl': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0'
    }, {
      'viewId': '3959700053363331',
      'title': '图片4',
      'src': 'https://www.ghumindiaghum.com/blog/wp-content/uploads/2020/12/dubaitour.jpg',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://www.ghumindiaghum.com/blog/wp-content/uploads/2020/12/dubaitour.jpg',
      'previewUrl': 'https://www.ghumindiaghum.com/blog/wp-content/uploads/2020/12/dubaitour.jpg'
    }, {
      'viewId': '5410148477778934',
      'title': '图片5',
      'src': 'https://pic4.zhimg.com/v2-668f4a23ea5a3feaf7e879782f72f569_720w.jpg?source=172ae18b',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://pic4.zhimg.com/v2-668f4a23ea5a3feaf7e879782f72f569_720w.jpg?source=172ae18b',
      'previewUrl': 'https://pic4.zhimg.com/v2-668f4a23ea5a3feaf7e879782f72f569_720w.jpg?source=172ae18b'
    }, {
      'viewId': '6874207465573064',
      'title': '图片6',
      'src': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'previewUrl': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0'
    }]
  }, {
    'icon': '/node/http-api.svg',
    'label': '视频',
    'column': 2,
    'align': 'LEFT',
    'layout': 'GRID',
    'rows': null
  }, {
    'icon': '/node/http-api.svg',
    'label': 'markdown',
    'column': 1,
    'align': 'CENTER',
    'layout': 'PAGE',
    'rows': [{
      'viewId': '4807773884845151',
      'title': '标题：markdown',
      'description': 'artqwpcfvxrnnryboslrvplbyacshowxkvhffxhjhbeoclqwlirafwkbivjhcfomtpcpynzjadenbhzsfkyqocamwdmjaiwiqlnsxmuwvkznfhiifaffxppjworujwwcpifvbivmteofdlkcknrmtz',
      'data': '# 标题的内容1. **基本信息**\n   - 姓名：[你的名字]\n   - 年龄：[你的年龄]\n   - 出生地/现居地：[你的出生地或现在居住的城市]\n\n2. **教育背景**\n   - 最高学历：[你的最高学历，例如“本科”、“硕士”等]\n   - 毕业院校及专业：[你毕业的学校名称以及所学专业]\n   - 相关课程/成就：[你在校期间学习的相关课程或者取得的重要成就]',
      'viewType': 'markdown'
    }]
  }, {
    'icon': '/node/http-api.svg',
    'label': '文件',
    'column': 2,
    'align': 'LEFT',
    'layout': 'GRID',
    'rows': [{
      'viewId': '4105600756359951',
      'title': '文件1',
      'src': 'https://mdpi-res.com/d_attachment/energies/energies-15-07288/article_deploy/energies-15-07288-v2.pdf?version=1665288575',
      'description': '文件描述',
      'data': null,
      'viewType': 'file'
    }, {
      'viewId': '6641546998093413',
      'title': '文件2',
      'src': 'https://mdpi-res.com/d_attachment/energies/energies-15-07288/article_deploy/energies-15-07288-v2.pdf?version=1665288575',
      'description': '文件描述',
      'data': null,
      'viewType': 'file'
    }, {
      'viewId': '7611910319948261',
      'title': '文件3',
      'src': 'https://mdpi-res.com/d_attachment/energies/energies-15-07288/article_deploy/energies-15-07288-v2.pdf?version=1665288575',
      'description': '文件描述',
      'data': null,
      'viewType': 'file'
    }, {
      'viewId': '9005340367816835',
      'title': '文件4',
      'src': 'https://mdpi-res.com/d_attachment/energies/energies-15-07288/article_deploy/energies-15-07288-v2.pdf?version=1665288575',
      'description': '文件描述',
      'data': null,
      'viewType': 'file'
    }]
  }, {
    'icon': '/node/http-api.svg',
    'label': '聊天',
    'column': 0,
    'align': 'CENTER',
    'layout': 'CHAT',
    'rows': [{
      'viewId': '8690595524323093',
      'icon': '/node/todo_list.svg',
      'title': 'kweqdbfwtdxkwmyizcrawozotqtssxpwddnukrmabiujguimklvqipdzygiy',
      'description': '聊天描述',
      'data': 'bxtelsihteojkfqmpjpjaqvcsxpxjpbarnlhueuwtwelsjxrqbumhwqdpkxdmjsjmqhsaphivfhjanqwczrvrhnnnonoysilurqotxuwvfvhrtesgrdkasukwpqlxjipgpymksxfbtmmomedoceebe',
      'viewType': 'text',
      'userName': '贡煜城',
      'userId': '7'
    }, {
      'viewId': '3761239916734749',
      'icon': '/node/todo_list.svg',
      'title': 'flvxkbqgrajlxkgkvmdllqoskznujucxfujffmigpzvrlnjulakjebhskzpd',
      'description': '聊天描述',
      'data': 'vaqcovtpbcppzgeyewferbcmqasozrxqbavpjncmislrremuwxsrryxihmllisfrlcuaskbiiudwyuizjayfpwaaanvwwmopngvxmofflaapkujfzknnuasvzbyiuozldvffkozboppucpooaylpzm',
      'viewType': 'text',
      'userName': '公冶俊驰',
      'userId': '4'
    }, {
      'viewId': '1143207216760133',
      'icon': '/node/todo_list.svg',
      'title': 'cdnudkhocrovsshhswgumzsfkkupewjlowstrzzuohxxsrusyrjtsdxzpemb',
      'description': '聊天描述',
      'data': 'agvbtnkqvoruuvooqemozwjpednzltmffqsudyacqlzlsurbcztzmzzmputkftaylgmwbzirulcvedxmktgujajgdrrezdqvvkzgicaopwdezpiaiisaglcenuqnmeiqxgiivglvxifzsmfghcreaq',
      'viewType': 'text',
      'userName': '逯烨霖',
      'userId': '5'
    }, {
      'viewId': '8062003671892574',
      'icon': '/node/todo_list.svg',
      'title': '图片结果',
      'src': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'description': '图片描述',
      'data': null,
      'viewType': 'image',
      'downloadUrl': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'previewUrl': 'https://ts1.cn.mm.bing.net/th/id/R-C.bd761f3d24ed5d5b94bf9406bd0595c4?rik=CgCy16TQXKpWRQ&riu=http%3a%2f%2fpic.ntimg.cn%2f20130606%2f2531170_104007297000_2.jpg&ehk=dOJc%2fEY4AUn1YOZ4YxxE4m5eCr0Ix8CNRAvfbNNMLPU%3d&risl=&pid=ImgRaw&r=0',
      'userName': '葛瑾瑜',
      'userId': '7'
    }, {
      'viewId': '9736193733045498',
      'icon': '/node/todo_list.svg',
      'title': '文件结果',
      'src': 'https://mdpi-res.com/d_attachment/energies/energies-15-07288/article_deploy/energies-15-07288-v2.pdf?version=1665288575',
      'description': '文件描述',
      'data': null,
      'viewType': 'file',
      'userName': '麴荣轩',
      'userId': '5'
    }, {
      'viewId': '6028371682794996',
      'icon': '/node/todo_list.svg',
      'title': '视频结果',
      'src': 'https://sfile.chatglm.cn/testpath/video/1aa1515f-1193-58bf-83d7-3bd62b765f62_0.mp4',
      'description': '视频描述',
      'data': null,
      'viewType': 'video',
      'downloadUrl': 'https://sfile.chatglm.cn/testpath/video/1aa1515f-1193-58bf-83d7-3bd62b765f62_0.mp4',
      'previewUrl': 'https://sfile.chatglm.cn/testpath/video/1aa1515f-1193-58bf-83d7-3bd62b765f62_0.mp4',
      'userName': '祁钰轩',
      'userId': '5'
    }]
  }, {
    'icon': '/node/http-api.svg', 'label': '表格', 'column': 1, 'align': 'LEFT', 'layout': 'TABLE', 'rows': [{
      'viewId': '0326897811863054', 'title': '表格', 'description': '表格描述', 'data': {
        'list': [{
          'birthday': '2000-03-29',
          'address': 'Apt. 580 鲁栋160号, 揭阳, 浙 951879',
          'phone': '174 0466 2955',
          'name': '归豪',
          'company': '穆, 司寇 and 蓟',
          'title': 'Customer Government Strategist',
          'idNumber': '6602162079187',
          'age': 57,
          'email': '建辉.荆@gmail.com'
        }, {
          'birthday': '1987-07-20',
          'address': 'Suite 619 翁街2号, 阳泉, 浙 895767',
          'phone': '145 4345 8029',
          'name': '郜君浩',
          'company': '庞, 越 and 仲孙',
          'title': 'Human Officer',
          'idNumber': '7705147460080',
          'age': 37,
          'email': '晓博.宣@yahoo.com'
        }, {
          'birthday': '1961-01-27',
          'address': 'Suite 743 强桥2110号, 大连, 黑 249685',
          'phone': '174 0164 0713',
          'name': '廖致远',
          'company': '施, 席 and 轩辕',
          'title': 'Community-Services Facilitator',
          'idNumber': '9905083544180',
          'age': 25,
          'email': '鸿煊.荣@yahoo.com'
        }, {
          'birthday': '1977-06-03',
          'address': '贲街9号, 包头, 宁 031814',
          'phone': '174 0357 0876',
          'name': '通哲瀚',
          'company': '蔡 Group',
          'title': 'Accounting Engineer',
          'idNumber': '8901266525089',
          'age': 38,
          'email': '智宸.乌@yahoo.com'
        }, {
          'birthday': '2005-10-12',
          'address': '冯旁27号, 舟山, 青 944143',
          'phone': '150 2623 6856',
          'name': '壤驷文',
          'company': '蔺-时',
          'title': 'Construction Executive',
          'idNumber': '2211196025085',
          'age': 48,
          'email': '煜祺.顾@gmail.com'
        }, {
          'birthday': '1966-08-30',
          'address': '百桥73号, 西安, 吉 769542',
          'phone': '174 0522 4914',
          'name': '能昊然',
          'company': '单于 Inc',
          'title': 'International IT Developer',
          'idNumber': '5802148773082',
          'age': 23,
          'email': '文.燕@gmail.com'
        }, {
          'birthday': '1968-11-28',
          'address': '公西中心024号, 揭阳, 港 107672',
          'phone': '167 6847 0388',
          'name': '晋绍齐',
          'company': '空 LLC',
          'title': 'Investor Advertising Engineer',
          'idNumber': '3012041597180',
          'age': 20,
          'email': '文.印@gmail.com'
        }, {
          'birthday': '2004-05-21',
          'address': 'Apt. 836 岑侬10号, 荆州, 晋 279913',
          'phone': '145 1514 0975',
          'name': '成弘文',
          'company': '戚 LLC',
          'title': 'National Advertising Executive',
          'idNumber': '1904125689085',
          'age': 59,
          'email': '鸿煊.邴@hotmail.com'
        }, {
          'birthday': '1988-03-20',
          'address': 'Suite 813 仲孙桥39号, 太仓, 渝 147625',
          'phone': '174 0280 6417',
          'name': '羊舌越泽',
          'company': '奚-喻',
          'title': 'IT Producer',
          'idNumber': '2209249699187',
          'age': 35,
          'email': '鸿煊.牛@gmail.com'
        }, {
          'birthday': '1992-01-21',
          'address': '蒲中心06694号, 泸州, 苏 873567',
          'phone': '174 0529 8332',
          'name': '盛嘉懿',
          'company': '洪 Inc',
          'title': 'Forward Technology Analyst',
          'idNumber': '6107103552086',
          'age': 59,
          'email': '鹭洋.巴@yahoo.com'
        }],
        'startTime': 1728038315753,
        'consume': 0,
        'message': null,
        'schemaFields': [{
          'name': '姓名',
          'code': 'name',
          'valueType': 'STRING',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '年龄',
          'code': 'age',
          'valueType': 'INTEGER',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '职业',
          'code': 'title',
          'valueType': 'INTEGER',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '地址',
          'code': 'address',
          'valueType': 'STRING',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '邮箱',
          'code': 'email',
          'valueType': 'STRING',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '手机号',
          'code': 'phone',
          'valueType': 'STRING',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '公司',
          'code': 'company',
          'valueType': 'STRING',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '生日',
          'code': 'birthday',
          'valueType': 'DATE',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }, {
          'name': '身份证号',
          'code': 'idNumber',
          'valueType': 'STRING',
          'value': null,
          'comment': null,
          'parentCode': null,
          'format': null,
          'fieldScope': null
        }],
        'pagination': {'pageSize': 10, 'current': 1, 'total': 10, 'totalPage': 1}
      }, 'viewType': 'table'
    }]
  }, {
    'icon': '/node/http-api.svg',
    'label': '嵌入',
    'column': 2,
    'align': 'LEFT',
    'layout': 'GRID',
    'rows': [{
      'viewId': '1791903715002951',
      'title': '嵌入链接展示1',
      'src': '//player.bilibili.com/player.html?isOutside=true&aid=236534017&bvid=BV1xe411Z7oj&cid=1349699744&p=1',
      'description': '嵌入卡片描述',
      'data': null,
      'viewType': 'embed',
      'previewUrl': '//player.bilibili.com/player.html?isOutside=true&aid=236534017&bvid=BV1xe411Z7oj&cid=1349699744&p=1'
    }, {
      'viewId': '0721844980776971',
      'title': '嵌入链接展示2',
      'src': '//player.bilibili.com/player.html?isOutside=true&aid=113192923631355&bvid=BV1LjsvejEvj&cid=25988042137&p=1',
      'description': '嵌入卡片描述',
      'data': null,
      'viewType': 'embed',
      'previewUrl': '//player.bilibili.com/player.html?isOutside=true&aid=113192923631355&bvid=BV1LjsvejEvj&cid=25988042137&p=1'
    }]
  }], 'contextId': null, 'consume': 0, 'flowKey': null, 'revision': 0
}

const DataPage: React.FC<AppPageInfo> = () => {
  const formRef = useRef(null)
  const { t, loading: i18nLoading } = useI18n(['app', 'common'])

  if (window.AppEvent) {
    window.AppEvent.useSubscription(event => {
      console.info(event)
    })
  }

  const {formatedLayout} = useModel('AppEditor', (model) => ({
    formatedLayout: model.formatedLayout
  }));

  const renderAppWidgets = () => {
    const {widgets, layouts} = formatedLayout
    return (
      <div className={styles.widgetsWrapper}>
        <div className={styles.widgetsTitle}>
          <span>{t('app.data.setting.title')}</span>
        </div>
        <div className={cls(styles.widgetsList, 'custom-scrollbar')}>
          <WidgetsRender
            appType="app"
            pageType="preview"
            layouts={layouts}
            widgets={widgets}
            getFormInstance={form => {
              formRef.current = form
            }}
          />
        </div>
      </div>
    )
  };

  const renderResultContainer = () => {

    return (
      <div className={styles.resultContainer}>
        <DataResult dataSource={response.body} />
      </div>
    )
  }

  const renderPageContent = () => {
    return (
      <div className={cls(styles.pageContent, styles.dataPage)}>
        {renderAppWidgets()}
        {renderResultContainer()}
      </div>
    )
  }

  const renderAppPage = () => {
    return (
      <div className={cls(styles.pageWrapper, styles.hideNav)}>
        {renderPageContent()}
      </div>
    );
  };

  if (i18nLoading) {
    return <PageLoading />
  }

  return renderAppPage();
};

export default DataPage;
