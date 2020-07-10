package com.code.generate.service;

import com.code.generate.utils.GenUtils;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.code.generate.dao.SysGeneratorMapper;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipOutputStream;

/**
 * 代码生成器
 * @author earl
 * @date 2017-05-18 11:04
 */
@Service
public class SysGeneratorService {

	@Autowired
	private SysGeneratorMapper sysGeneratorMapper;

	public PageInfo<Map<String, Object>> pageList(int pageNum,int pageSize,String seacher) {
		PageHelper.startPage(pageNum, pageSize);
		List<Map<String, Object>> list = sysGeneratorMapper.pageList(seacher);
		PageInfo<Map<String, Object>> pageInfo = new PageInfo <>(list);
		return pageInfo;
	}

	public Map<String, String> queryTable(String tableName) {
		return sysGeneratorMapper.queryTable(tableName);
	}

	public List<Map<String, String>> queryColumns(String tableName) {
		return sysGeneratorMapper.queryColumns(tableName);
	}

	public byte[] generatorCode(String[] tableNames) {
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		ZipOutputStream zip = new ZipOutputStream(outputStream);

		for(String tableName : tableNames){
			//查询表信息
			Map<String, String> table = queryTable(tableName);
			//查询列信息
			List<Map<String, String>> columns = queryColumns(tableName);
			//生成代码
			GenUtils.generatorCode(table, columns, zip);
		}
		IOUtils.closeQuietly(zip);
		return outputStream.toByteArray();
	}

}
