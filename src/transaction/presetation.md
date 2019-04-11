# 原理
[mongo中文社区博客](http://www.mongoing.com/%3Fp%3D6084)
# 事务如何开启
## 坑1
count全局和有query的count表现不一致
## 坑2
事务不提交, 


如果你的架构是分片Sharding模式，事务是不支持的。分布式事务计划在4.2版本里支持

