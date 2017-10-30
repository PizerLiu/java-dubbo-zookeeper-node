package pizer.Service.Impl;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import pizer.JdznTestMain;
import pizer.Service.ExampleTestService;

import java.util.Date;

@Service("exampleTestService")
public class ExampleTestServiceImpl implements ExampleTestService{

    @Override
    public String OutString(String res) {

        Logger log = Logger.getLogger(JdznTestMain.class);

        log.debug("java-dubbo-zookeeper-node 项目启动于 —— " + new Date());
        System.out.println("----------"+res);
        return res;
    }
}
