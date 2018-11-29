------------------------------------------------------------------------------------------------
1.项目结构(主要功能部分)
1.1 examples 测试示例
1.2 lib      水龙头库
    1.2.1   conf    配置文件夹
            /db.js      数据库配置
            /filters.js 过滤器配置
            /sys.js     系统配置（目前是用configHandle从数据库读写）

    1.2.1   filters 过滤器文件夹
            /filter.js  主要过滤方法的实现 后期可考虑分多文件

    1.2.1   sql     sqlMapping文件夹
            /account.js    账户相关sql
            /config.js     系统配置相关sql
            /invitation.js 邀请码相关sql
            /ip.js         ip地址相关sql

    1.2.1   utils   工具文件夹
            /configHandle.js    读写系统配置模块
            /dbHandle.js        数据库操作模块
            /invitation.js      邀请码操作模块
            /routerHandle.js    封装的express路由模块（路由写法都用routerHandle来完成，以便实现过滤）
            /seedHandle.js      uid种子操作模块
            /tools.js           常用工具
            /validation.js      验证模块

1.3 router   express路由，目前所有路由都配置在api中
------------------------------------------------------------------------------------------------
2.表结构
2.1     account     用户表初版，还待完善
        seed            int             uid种子
        uid             int
        username        varchar(32)     用户名
        nickname        varchar(32)     昵称
        head_img        text            头像（计划存base64）
        is_post         bool            是否作者权限
        is_referrer     bool            是否推荐人
        is_create       bool            是否可创建用户
        is_admin        bool            是否管理员
        registrar       init            注册人（商）
        referrer        init            推荐人
        create_date     long            创建时间
        lastmodify_date long            最后修改时间
	    phone		    varchar(20)	    用户认证电话，可空
	    microletter	    varchar(100)	用户认证微信,可空

	
2.2     invitationCode  邀请码记录表
        code            varchar(10)     邀请码
        create          ini             创建人uid
        create_date     long            创建时间
        consumer        ini             消费人uid
        consume_date    long            消费时间
        is_consume      bool            是否被消费

2.3     ipInfo    ip操作记录
        ip              varchar(15)     ip地址
        ctrl            varchar(20)     操作方式
        lastmodify      long            最后操作时间

2.4     sysConfig       系统配置
        key             varchar(50)     配置键
        content         text            配置内容
        type            varchar(10)     配置内容数据类型
        remark          varchar(100)    备注
------------------------------------------------------------------------------------------------
3.功能(目前仅api)
3.1     POST 创建账户
        地址          /v1/createAccount
        过滤器        checkCreateAccount
        过滤方法       checkIP          检查ip时间范围内不可操作
                      checkUsername    检查用户名不重复
        示例参数
         "account": {
             "name": "poster",
             "nickname": "昵称"
             "owner_key": "YYW7LqX5PdL23JeXq4oFDbVqFJumsbdr9YEFT3AHmx4cSpjXFVuiN",
             "active_key": "YYW56hz5onR5NmnWKkDn8rtGzsJr9MWjqLUaoRBdE36P1aaRrWrmn",
             "secondary_key":"YYW5vLbQeKU3UyRBT51vpHhYk1SRYpgLUS9NnbGM2zoFG9yme49pu",
             "referrer": 26861, 可空-默认为配置的推荐人
         }

3.2     POST 账户管理：赋予/取消 发帖权限、回帖权限、评价权限
        地址           /v1/accountManage
        过滤器         checkAccountManage
        过滤方法        checkInvitationValid    检查邀请码有效性
        示例参数
        [{
                "account": 540296,
                "code":"asldkfjalsdfk",
                "executor": 25638,
                "options":{"can_post":true}
            },
         checksum]

         备注：还缺checksum验证，流程还有疑问如下，
         操作者executor通过api获取验证码  发送给  被操作者account
         那么修改这个动作是谁发起？
         如果是操作者executor发起，那上一步这个动作就没任何意义，只要他执行就行了，无需邀请码
         如果是被操作者account发起，那么checksum需要操作者executor的公钥和私钥来验证这个动作，就是说
         被操作者account其实是发起一个消息来通知操作者executor，然后操作者executor收到这个通知再来进行这个请求？
	Necklace回答：是被操作者发起，由操作者审核信息（如昵称是否非法），再由操作者提交到水龙头完成操作。因为现在只有我们（注册商）才有操作权限
		      所以这个executor是可以不传的，以前是考虑到有可能给平台管理员这个权限的。所以这里是有问题的，还应该有管理界面和一个被操作者
		      发起接口，这个东西才完整。这一部分是后面要做进wordpress插件里的功能，所以现在我就没有写了。先完成基本钱包			




3.3     GET  获取账户信息
        地址            /v1/getAccount
        示例参数
        ?uid=25600453

3.4     GET  获取邀请码
        地址            /v1/getCode
        过滤器          checkGetCode
        过滤方法        checkCanPost            检查是否发帖权限
                       checkInvitationCount    检查邀请码当日生成数量是否上限
        示例参数
        ?uid=25600453

3.5     GET  获取配置
        地址           /sysConf/get
        过滤器         checkAdmin
        过滤方法        checkAdmin              检查是否有管理员权限
        示例参数
        ?uid=25600453&key=配置键

3.6     POST 设置配置
        地址          /sysConf/set
        过滤器         checkAdmin
        过滤方法        checkAdmin              检查是否有管理员权限
        示例参数
        {
          key: 'post_need_code',
          content: true,
          remark: '开启发帖权是否需要激活码'
        }

3.7     GET 删除配置
        地址          /sysConf/del
        过滤器         checkAdmin
        过滤方法        checkAdmin              检查是否有管理员权限
        示例参数
        ?key=配置键

3.8     POST 请求使用邀请码
        地址          /v1/useCode
        过滤器         checkUseCode
        过滤方法        checkUidExist           检查请求用户是否存在(根据uid判断)
                       checkInvitationValid    检查邀请码有效性
        示例参数
        {
            uid: 25601240,
            code: 'BNYOH9'
        }

3.9     GET 获取邀请码 系列操作 申请列表
        地址          /v1/applyCodeList
        过滤器         checkUidExist
        过滤方法        checkUidExist           检查请求用户是否存在
        示例参数
        ?uid=25601240

------------------------------------------------------------------------------------------------
4. 业务流程
4.1 获取及使用邀请码
    作者权限操作者 发起获取邀请码
    被操作者 使用邀请码发起申请 (使用邀请码为操作invitationCode表，填入消费者uid，视为申请动作)
    操作者 查询申请信息，执行操作（3.2）

1，SqlMapping
2，修改审核接口 及 库
3，api全局实例