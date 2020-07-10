package com.code.generate.controller;

import com.code.generate.service.SysGeneratorService;
import com.github.pagehelper.PageInfo;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/**
 * 代码生成器
 * @author liuyuan
 * @date 2017-05-18 10:59
 */
@Controller
@RequestMapping("/generator")
@Api( description="代码接口")
public class SysGeneratorController {
	@Autowired
	private SysGeneratorService sysGeneratorService;


	/**
	 * 列表
	 */
	@RequestMapping(value = "/list",method = RequestMethod.POST)
	@ResponseBody
	@ApiOperation(value = "数据库表分页列表",response = PageInfo.class)
	@ApiImplicitParams({
			@ApiImplicitParam(paramType = "query", dataType="int", name = "pageNum", value = "页码，为空时默认1" ),
			@ApiImplicitParam(paramType = "query", dataType="int", name = "pageSize", value = "页数,为空时默认20" ),
			@ApiImplicitParam(paramType = "query", dataType="string", name = "search", value = "搜索字符" )
	})
	public PageInfo<Map<String, Object>> list(@RequestParam(defaultValue = "1") Integer pageNum,
											  @RequestParam(defaultValue = "20")Integer pageSize, String search){
		//查询列表数据
		return  sysGeneratorService.pageList(pageNum,pageSize,search) ;
	}

	/**
	 * 生成代码
	 */
	@RequestMapping(value = "/code",method = {RequestMethod.GET,RequestMethod.POST})
	@ApiOperation(value = "代码生成接口" )
	public void code(String tables,HttpServletRequest request, HttpServletResponse response) throws IOException{
		String[] tableNames = StringUtils.split(tables,",");
		byte[] data = sysGeneratorService.generatorCode(tableNames);
		response.reset();
        response.setHeader("Content-Disposition", "attachment; filename=\"code.zip\"");
        response.addHeader("Content-Length", "" + data.length);
        response.setContentType("application/octet-stream; charset=UTF-8");
        IOUtils.write(data, response.getOutputStream());
	}
}
